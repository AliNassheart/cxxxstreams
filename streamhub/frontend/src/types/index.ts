export type UserRole = 'admin' | 'streamer' | 'viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export type StreamStatus = 'offline' | 'live' | 'ended';

export interface Stream {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  stream_key: string;
  status: StreamStatus;
  hls_url: string | null;
  viewer_count: number;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  streamId: string;
  userId: string;
  username: string;
  role: UserRole;
  body: string;
  createdAt: string;
}
