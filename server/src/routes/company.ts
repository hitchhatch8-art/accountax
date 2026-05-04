import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { companyMiddleware, type CompanyRequest } from '../middleware/company.js';

const router = Router();

router.use(authMiddleware as any);
router.use(companyMiddleware as any);

// ─── GET /api/company ───
router.get('/', async (req: CompanyRequest, res) => {
  try {
    // Company already resolved by companyMiddleware
    res.json(req.company);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── PUT /api/company ───
router.put('/', async (req: CompanyRequest, res) => {
  try {
    const { name, ice, ifNum, rc, address, phone, logo } = req.body;

    const updated = await prisma.company.update({
      where: { id: req.company!.id },
      data: {
        ...(name !== undefined && { name }),
        ...(ice !== undefined && { ice }),
        ...(ifNum !== undefined && { ifNum }),
        ...(rc !== undefined && { rc }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(logo !== undefined && { logo }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
