import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initSocket } from './socket';
import authRoutes from './routes/auth';
import streamRoutes from './routes/streams';
import userRoutes from './routes/users';
import mediaRoutes from './routes/media';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = initSocket(httpServer);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'streamhub-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/streams', streamRoutes(io));
app.use('/api/users', userRoutes);
app.use('/api/media', mediaRoutes);

// 404 fallback
app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));

// Centralized error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

const PORT = Number(process.env.PORT) || 4000;
httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`StreamHub backend listening on port ${PORT}`);
});
