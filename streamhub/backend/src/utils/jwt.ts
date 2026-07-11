import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

export interface AccessTokenPayload {
  sub: string; // user id
  username: string;
  role: UserRole;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('JWT secrets are not set. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in .env before production use.');
}

export const signAccessToken = (payload: AccessTokenPayload) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });

export const signRefreshToken = (payload: { sub: string }) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;

export const verifyRefreshToken = (token: string): { sub: string } =>
  jwt.verify(token, REFRESH_SECRET) as { sub: string };
