import { Router } from 'express';
import type { Server as SocketIOServer } from 'socket.io';
import {
  createStream,
  deleteStream,
  getStream,
  listAllStreams,
  listLiveStreams,
  listMyStreams,
  makeRtmpAuthHandler,
  makeRtmpDoneHandler,
  regenerateStreamKey,

  updateStream,
} from '../controllers/streamController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

export default function streamRoutes(io: SocketIOServer) {
  const router = Router();

  // Public: browse currently live streams (viewers, no auth required).
  router.get('/live', listLiveStreams);
  router.get('/:id', getStream);

  // Authenticated: streamers manage their own streams; admins manage all.
  router.get('/', requireAuth, requireRole('admin'), listAllStreams);
  router.get('/mine/list', requireAuth, requireRole('streamer', 'admin'), listMyStreams);
  router.post('/', requireAuth, requireRole('streamer', 'admin'), createStream);
  router.patch('/:id', requireAuth, requireRole('streamer', 'admin'), updateStream);
  router.delete('/:id', requireAuth, requireRole('streamer', 'admin'), deleteStream);
  router.post('/:id/regenerate-key', requireAuth, requireRole('streamer', 'admin'), regenerateStreamKey);

  // RTMP server webhooks (called by Nginx-RTMP on the owner's own ingest server,
  // not exposed to end users). Protect this path at the network/reverse-proxy layer.

  router.post('/rtmp/on-publish', makeRtmpAuthHandler(io));
  router.post('/rtmp/on-publish-done', makeRtmpDoneHandler(io));

  return router;
}
