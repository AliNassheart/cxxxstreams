import type { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { StreamModel } from '../models/Stream';
import { query } from '../config/db';

interface AuthedSocket extends Socket {
  data: {
    userId?: string;
    username?: string;
    role?: string;
  };
}

// In-memory viewer registry: streamId -> Set of socket ids currently watching.
// For multi-instance deployments, back this with Redis (see README deployment notes).
const viewersByStream = new Map<string, Set<string>>();

function roomName(streamId: string) {
  return `stream:${streamId}`;
}

function currentViewerCount(streamId: string) {
  return viewersByStream.get(streamId)?.size ?? 0;
}

export function initSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Optional auth: guests may watch + view chat, but only authenticated users may post messages.
  io.use((socket: AuthedSocket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (token) {
      try {
        const payload = verifyAccessToken(token);
        socket.data.userId = payload.sub;
        socket.data.username = payload.username;
        socket.data.role = payload.role;
      } catch {
        // invalid token: proceed as guest rather than rejecting the connection
      }
    }
    next();
  });

  io.on('connection', (socket: AuthedSocket) => {
    let joinedStreamId: string | null = null;

    socket.on('stream:join', async ({ streamId }: { streamId: string }) => {
      if (!streamId) return;
      joinedStreamId = streamId;
      socket.join(roomName(streamId));

      if (!viewersByStream.has(streamId)) viewersByStream.set(streamId, new Set());
      viewersByStream.get(streamId)!.add(socket.id);

      const count = currentViewerCount(streamId);
      await StreamModel.setViewerCount(streamId, count);
      io.to(roomName(streamId)).emit('stream:viewerCount', { streamId, count });
    });

    socket.on('stream:leave', async ({ streamId }: { streamId: string }) => {
      leaveStream(streamId, socket, io);
      joinedStreamId = null;
    });

    socket.on('chat:message', async ({ streamId, body }: { streamId: string; body: string }) => {
      if (!socket.data.userId || !socket.data.username) {
        socket.emit('chat:error', { error: 'You must be logged in to chat.' });
        return;
      }
      const trimmed = (body || '').trim().slice(0, 500);
      if (!trimmed) return;

      const { rows } = await query(
        `INSERT INTO chat_messages (stream_id, user_id, body) VALUES ($1, $2, $3)
         RETURNING id, created_at`,
        [streamId, socket.data.userId, trimmed]
      );

      io.to(roomName(streamId)).emit('chat:message', {
        id: rows[0].id,
        streamId,
        userId: socket.data.userId,
        username: socket.data.username,
        role: socket.data.role,
        body: trimmed,
        createdAt: rows[0].created_at,
      });
    });

    socket.on('disconnect', () => {
      if (joinedStreamId) {
        leaveStream(joinedStreamId, socket, io);
      }
    });
  });

  function leaveStream(streamId: string, socket: AuthedSocket, ioRef: SocketIOServer) {
    socket.leave(roomName(streamId));
    viewersByStream.get(streamId)?.delete(socket.id);
    const count = currentViewerCount(streamId);
    StreamModel.setViewerCount(streamId, count).catch(() => undefined);
    ioRef.to(roomName(streamId)).emit('stream:viewerCount', { streamId, count });
  }

  return io;
}
