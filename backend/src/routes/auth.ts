import { Router } from 'express';
import { z } from 'zod';
import db from '../db';
import { signToken, verifyPassword } from '../utils/auth';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
});

router.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: '参数校验失败', errors: parsed.error.flatten() });
  }

  type AdminRow = {
    id: number;
    username: string;
    password_hash: string;
  };

  const admin = db
    .prepare('SELECT * FROM admins WHERE username = ?')
    .get(parsed.data.username) as AdminRow | undefined;

  if (!admin || !verifyPassword(parsed.data.password, admin.password_hash)) {
    return res.status(401).json({ message: '账号或密码错误' });
  }

  const secret = process.env.JWT_SECRET ?? 'photo_exhibition_secret';
  const token = signToken({ userId: admin.id, username: admin.username }, secret);
  res.json({ token, username: admin.username });
});

export default router;
