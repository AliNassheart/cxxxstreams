import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { UserModel, toPublicUser } from '../models/User';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';

const registerSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, and underscores only.'),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' });
  }
  const { username, email, password } = parsed.data;

  if (await UserModel.findByEmail(email)) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }
  if (await UserModel.findByUsername(username)) {
    return res.status(409).json({ error: 'That username is taken.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  // New accounts are viewers by default. Streamer/admin roles are granted by an admin.
  const user = await UserModel.create({ username, email, passwordHash, role: 'viewer' });

  const accessToken = signAccessToken({ sub: user.id, username: user.username, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id });

  return res.status(201).json({ user: toPublicUser(user), accessToken, refreshToken });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const { email, password } = parsed.data;

  const user = await UserModel.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const accessToken = signAccessToken({ sub: user.id, username: user.username, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id });

  return res.json({ user: toPublicUser(user), accessToken, refreshToken });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    return res.status(400).json({ error: 'refreshToken is required.' });
  }
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await UserModel.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'User no longer exists.' });

    const accessToken = signAccessToken({ sub: user.id, username: user.username, role: user.role });
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
}

export async function me(req: Request, res: Response) {
  const user = await UserModel.findById(req.user!.sub);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  return res.json({ user: toPublicUser(user) });
}
