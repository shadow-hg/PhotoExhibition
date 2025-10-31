import { NextFunction, Request, Response } from 'express';
import { verifyToken, JwtPayload } from '../utils/auth';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function requireAuth(secret: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: '缺少认证信息' });
    }

    const token = header.slice(7);
    try {
      const payload = verifyToken(token, secret);
      req.user = payload;
      next();
    } catch (error) {
      return res.status(401).json({ message: '认证失败' });
    }
  };
}
