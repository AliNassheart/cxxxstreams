import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true, // required for MinIO / most S3-compatible providers
});

const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

/**
 * Issues a short-lived presigned PUT URL so the client can upload a thumbnail
 * directly to object storage without proxying the file through this server.
 */
router.post('/thumbnail-upload-url', requireAuth, requireRole('streamer', 'admin'), async (req: Request, res: Response) => {
  const { contentType } = req.body as { contentType?: string };
  if (!contentType || !ALLOWED_TYPES.has(contentType)) {
    return res.status(400).json({ error: 'contentType must be image/png, image/jpeg, or image/webp.' });
  }

  const ext = contentType.split('/')[1];
  const key = `thumbnails/${req.user!.sub}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const publicUrl = `${process.env.S3_PUBLIC_URL}/${key}`;

  return res.json({ uploadUrl, publicUrl, key });
});

export default router;
