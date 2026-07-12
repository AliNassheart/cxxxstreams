import { query } from '../config/db';

export type StreamStatus = 'offline' | 'live' | 'ended';

export interface StreamRecord {
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

export const StreamModel = {
  async create(input: {
    ownerId: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    streamKey: string;
  }): Promise<StreamRecord> {
    const { rows } = await query(
      `INSERT INTO streams (owner_id, title, description, thumbnail_url, stream_key)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.ownerId, input.title, input.description ?? null, input.thumbnailUrl ?? null, input.streamKey]
    );
    return rows[0];
  },

  async findById(id: string): Promise<StreamRecord | null> {
    const { rows } = await query('SELECT * FROM streams WHERE id = $1', [id]);
    return rows[0] ?? null;
  },

  async findByStreamKey(streamKey: string): Promise<StreamRecord | null> {
    const { rows } = await query('SELECT * FROM streams WHERE stream_key = $1', [streamKey]);
    return rows[0] ?? null;
  },

  async listAll(): Promise<StreamRecord[]> {
    const { rows } = await query('SELECT * FROM streams ORDER BY created_at DESC');
    return rows;
  },

  async listLive(): Promise<StreamRecord[]> {
    const { rows } = await query(`SELECT * FROM streams WHERE status = 'live' ORDER BY viewer_count DESC`);
    return rows;
  },

  async listByOwner(ownerId: string): Promise<StreamRecord[]> {
    const { rows } = await query('SELECT * FROM streams WHERE owner_id = $1 ORDER BY created_at DESC', [ownerId]);
    return rows;
  },

  async updateMetadata(
    id: string,
    updates: Partial<{ title: string; description: string; thumbnailUrl: string }>
  ): Promise<StreamRecord | null> {
    const { rows } = await query(
      `UPDATE streams
       SET title = COALESCE($2, title),
           description = COALESCE($3, description),
           thumbnail_url = COALESCE($4, thumbnail_url),
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, updates.title, updates.description, updates.thumbnailUrl]
    );
    return rows[0] ?? null;
  },

  async setLive(id: string, hlsUrl: string): Promise<StreamRecord | null> {
    const { rows } = await query(
      `UPDATE streams
       SET status = 'live', hls_url = $2, started_at = now(), ended_at = NULL, updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, hlsUrl]
    );
    return rows[0] ?? null;
  },

  async setEnded(id: string): Promise<StreamRecord | null> {
    const { rows } = await query(
      `UPDATE streams
       SET status = 'ended', ended_at = now(), viewer_count = 0, updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return rows[0] ?? null;
  },

  async setViewerCount(id: string, count: number): Promise<void> {
    await query(`UPDATE streams SET viewer_count = $2, updated_at = now() WHERE id = $1`, [id, count]);
  },

  async updateStreamKey(id: string, streamKey: string): Promise<StreamRecord | null> {
    const { rows } = await query(
      `UPDATE streams SET stream_key = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [id, streamKey]
    );
    return rows[0] ?? null;
  },

  async delete(id: string): Promise<void> {

    await query('DELETE FROM streams WHERE id = $1', [id]);
  },
};
