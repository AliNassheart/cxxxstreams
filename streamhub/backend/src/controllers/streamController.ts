import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { StreamModel } from '../models/Stream';
import { UserModel } from '../models/User';
import type { Server as SocketIOServer } from 'socket.io';

const createSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().max(2000).optional(),
  thumbnailUrl: z.string().url().optional(),
});

const updateSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  description: z.string().max(2000).optional(),
  thumbnailUrl: z.string().url().optional(),
});

const generateStreamKey = () => randomBytes(20).toString('hex');

/** Only the platform owner/streamers/admins can create streams; enforced via requireRole in routes. */
export async function createStream(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' });
  }
  const stream = await StreamModel.create({
    ownerId: req.user!.sub,
    title: parsed.data.title,
    description: parsed.data.description,
    thumbnailUrl: parsed.data.thumbnailUrl,
    streamKey: generateStreamKey(),
  });
  return res.status(201).json({ stream });
}

export async function listLiveStreams(_req: Request, res: Response) {
  const streams = await StreamModel.listLive();
  return res.json({ streams });
}

export async function listAllStreams(_req: Request, res: Response) {
  const streams = await StreamModel.listAll();
  return res.json({ streams });
}

export async function listMyStreams(req: Request, res: Response) {
  const streams = await StreamModel.listByOwner(req.user!.sub);
  return res.json({ streams });
}

export async function getStream(req: Request, res: Response) {
  const stream = await StreamModel.findById(req.params.id);
  if (!stream) return res.status(404).json({ error: 'Stream not found.' });
  return res.json({ stream });
}

async function assertOwnerOrAdmin(req: Request, streamId: string) {
  const stream = await StreamModel.findById(streamId);
  if (!stream) return { stream: null, allowed: false };
  const allowed = req.user!.role === 'admin' || stream.owner_id === req.user!.sub;
  return { stream, allowed };
}

export async function updateStream(req: Request, res: Response) {
  const { stream, allowed } = await assertOwnerOrAdmin(req, req.params.id);
  if (!stream) return res.status(404).json({ error: 'Stream not found.' });
  if (!allowed) return res.status(403).json({ error: 'You do not own this stream.' });

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' });
  }
  const updated = await StreamModel.updateMetadata(stream.id, parsed.data);
  return res.json({ stream: updated });
}

export async function deleteStream(req: Request, res: Response) {
  const { stream, allowed } = await assertOwnerOrAdmin(req, req.params.id);
  if (!stream) return res.status(404).json({ error: 'Stream not found.' });
  if (!allowed) return res.status(403).json({ error: 'You do not own this stream.' });
  await StreamModel.delete(stream.id);
  return res.status(204).send();
}

/** Rotates the stream key. Old RTMP sessions using the previous key will be rejected on next publish. */
export async function regenerateStreamKey(req: Request, res: Response) {
  const { stream, allowed } = await assertOwnerOrAdmin(req, req.params.id);
  if (!stream) return res.status(404).json({ error: 'Stream not found.' });
  if (!allowed) return res.status(403).json({ error: 'You do not own this stream.' });

  const newKey = generateStreamKey();
  const updated = await StreamModel.updateStreamKey(stream.id, newKey);
  return res.json({ stream: updated });

}

/**
 * Webhook target for the owner-operated Nginx-RTMP `on_publish` directive.
 * Nginx posts the RTMP stream key (as `name`) before allowing a publish to proceed.
 * Only keys that exist in our database are authorized — this is the sole gate
 * on who may start a broadcast. It intentionally does not fetch or relay any
 * third-party stream; it only authorizes ingest from the owner's own encoder.
 */
export function makeRtmpAuthHandler(io: SocketIOServer) {
  return async function onPublish(req: Request, res: Response) {
    const streamKey = (req.body?.name || req.query?.name) as string | undefined;
    if (!streamKey) return res.status(400).send('missing stream key');

    const stream = await StreamModel.findByStreamKey(streamKey);
    if (!stream) return res.status(403).send('unauthorized stream key');

    const hlsUrl = `${process.env.HLS_BASE_URL}/${streamKey}/index.m3u8`;
    const updated = await StreamModel.setLive(stream.id, hlsUrl);
    io.to(`stream:${stream.id}`).emit('stream:status', { streamId: stream.id, status: 'live', hlsUrl });
    io.emit('stream:live', { stream: updated });
    return res.status(200).send('ok');
  };
}

export function makeRtmpDoneHandler(io: SocketIOServer) {
  return async function onPublishDone(req: Request, res: Response) {
    const streamKey = (req.body?.name || req.query?.name) as string | undefined;
    if (!streamKey) return res.status(400).send('missing stream key');

    const stream = await StreamModel.findByStreamKey(streamKey);
    if (!stream) return res.status(404).send('unknown stream key');

    const updated = await StreamModel.setEnded(stream.id);
    io.to(`stream:${stream.id}`).emit('stream:status', { streamId: stream.id, status: 'ended' });
    io.emit('stream:ended', { stream: updated });
    return res.status(200).send('ok');
  };
}

export async function promoteUser(req: Request, res: Response) {
  const { role } = req.body as { role?: 'admin' | 'streamer' | 'viewer' };
  if (!role || !['admin', 'streamer', 'viewer'].includes(role)) {
    return res.status(400).json({ error: 'role must be admin, streamer, or viewer.' });
  }
  const updated = await UserModel.updateRole(req.params.userId, role);
  if (!updated) return res.status(404).json({ error: 'User not found.' });
  return res.json({ user: { id: updated.id, username: updated.username, role: updated.role } });
}
