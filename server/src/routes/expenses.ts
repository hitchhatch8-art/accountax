import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { companyMiddleware, type CompanyRequest } from '../middleware/company.js';

const router = Router();

router.use(authMiddleware as any);
router.use(companyMiddleware as any);

// ─── Validation ─── [NEW]
const createExpenseSchema = z.object({
  number: z.string().min(1, 'Numéro requis'),
  date: z.string(),
  category: z.string().default('general'),
  supplier: z.string().min(1, 'Fournisseur requis'),
  status: z.enum(['paid', 'pending']).default('paid'),
  currency: z.string().default('DH'),
  totalHT: z.number().min(0, 'Montant HT doit être positif'),
  totalTVA: z.number().min(0),
  totalTTC: z.number().min(0),
});

const updateExpenseSchema = createExpenseSchema.partial();

// ─── GET /api/expenses ───
router.get('/', async (req: CompanyRequest, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { companyId: req.company!.id },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json(expenses);
  } catch (error) {
    console.error('Fetch expenses error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/expenses ───
router.post('/', async (req: CompanyRequest, res) => {
  try {
    const data = createExpenseSchema.parse(req.body);

    const newExpense = await prisma.expense.create({
      data: {
        ...data,
        companyId: req.company!.id,
      },
    });

    res.status(201).json(newExpense);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── PUT /api/expenses/:id ─── [NEW]
router.put('/:id', async (req: CompanyRequest, res) => {
  try {
    const id = req.params.id as string;
    const data = updateExpenseSchema.parse(req.body);

    const existing = await prisma.expense.findFirst({
      where: { id, companyId: req.company!.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Dépense non trouvée / المصروف غير موجود' });
      return;
    }

    const updated = await prisma.expense.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── DELETE /api/expenses/:id ───
router.delete('/:id', async (req: CompanyRequest, res) => {
  try {
    const id = req.params.id as string;

    // ✅ Vérifier ownership
    const expense = await prisma.expense.findFirst({
      where: { id, companyId: req.company!.id },
    });

    if (!expense) {
      res.status(404).json({ error: 'Dépense non trouvée / المصروف غير موجود' });
      return;
    }

    await prisma.expense.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
