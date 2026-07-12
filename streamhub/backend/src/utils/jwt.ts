import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

export interface AccessTokenPayload {
  sub: string;
  username: string;
  role: UserRole;
}

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not set');
  }
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not set');
  }
  return secret;
}

export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, getAccessSecret(), {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES ?? '15m') as jwt.SignOptions['expiresIn'],
  });

export const signRefreshToken = (payload: { sub: string }): string =>
  jwt.sign(payload, getRefreshSecret(), {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES ?? '7d') as jwt.SignOptions['expiresIn'],
  });

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, getAccessSecret()) as AccessTokenPayload;

export const verifyRefreshToken = (token: string): { sub: string } =>
  jwt.verify(token, getRefreshSecret()) as { sub: string };