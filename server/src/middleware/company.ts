import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest } from './auth.js';

/**
 * Middleware — بعد authMiddleware — يحقن req.company
 * يجنبنا تكرار نفس الـ 8 أسطر في كل route handler
 */
export interface CompanyRequest extends AuthRequest {
  company?: {
    id: string;
    name: string;
    [key: string]: any;
  };
}

export async function companyMiddleware(req: CompanyRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { company: true },
    });

    if (!user?.company) {
      res.status(404).json({ error: 'Entreprise non trouvée / لم يتم العثور على الشركة' });
      return;
    }

    req.company = user.company;
    next();
  } catch (error) {
    console.error('Company middleware error:', error);
    res.status(500).json({ error: 'Erreur serveur / خطأ في الخادم' });
  }
}
