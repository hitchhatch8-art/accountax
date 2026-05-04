import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ─── JWT Secret from .env (NO hardcoded fallback in production) ───
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET is not set in environment variables!');
  console.error('   → Create a server/.env file with: JWT_SECRET=your-secret-here');
  process.exit(1);
}

export interface AuthRequest extends Request {
  userId?: string;
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET!, { expiresIn: '7d' });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token manquant / الرمز مفقود' });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET!) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide / الرمز غير صالح' });
    return;
  }
}

export { JWT_SECRET };
