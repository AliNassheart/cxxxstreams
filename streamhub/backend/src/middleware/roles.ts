import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../models/User';

/**
 * Restricts a route to one or more roles. Must run after requireAuth.
 * Admins implicitly pass every role check.
 */
export function requireRole(...allowed: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (req.user.role === 'admin' || allowed.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ error: 'You do not have permission to perform this action.' });
  };
}
