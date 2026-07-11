import { Router } from 'express';
import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { promoteUser } from '../controllers/streamController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

router.get('/', requireAuth, requireRole('admin'), async (_req: Request, res: Response) => {
  const users = await UserModel.list();
  res.json({ users: users.map(({ password_hash: _omit, ...rest }) => rest) });
});

router.patch('/:userId/role', requireAuth, requireRole('admin'), promoteUser);

export default router;
