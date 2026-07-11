import { query } from '../config/db';

export type UserRole = 'admin' | 'streamer' | 'viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type PublicUser = Omit<User, 'password_hash'>;

export const toPublicUser = (user: User): PublicUser => {
  const { password_hash: _omit, ...rest } = user;
  return rest;
};

export const UserModel = {
  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] ?? null;
  },

  async findByUsername(username: string): Promise<User | null> {
    const { rows } = await query('SELECT * FROM users WHERE username = $1', [username]);
    return rows[0] ?? null;
  },

  async findById(id: string): Promise<User | null> {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] ?? null;
  },

  async create(input: {
    username: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
  }): Promise<User> {
    const { rows } = await query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.username, input.email, input.passwordHash, input.role ?? 'viewer']
    );
    return rows[0];
  },

  async updateRole(id: string, role: UserRole): Promise<User | null> {
    const { rows } = await query(
      `UPDATE users SET role = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [id, role]
    );
    return rows[0] ?? null;
  },

  async list(): Promise<User[]> {
    const { rows } = await query('SELECT * FROM users ORDER BY created_at DESC');
    return rows;
  },
};
