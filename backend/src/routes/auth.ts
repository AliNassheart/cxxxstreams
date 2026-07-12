import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, me, refresh, register } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Slow down brute-force attempts on auth endpoints.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', authLimiter, refresh);
router.get('/me', requireAuth, me);

export default router;
