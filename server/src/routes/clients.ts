import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { companyMiddleware, type CompanyRequest } from '../middleware/company.js';

const router = Router();

// All client routes require auth + company
router.use(authMiddleware as any);
router.use(companyMiddleware as any);

// ─── Validation ───
const createClientSchema = z.object({
  name: z.string().min(2, 'Nom: 2 caractères minimum'),
  ice: z.string().default(''),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

const updateClientSchema = createClientSchema.partial();

// ─── GET /api/clients ───
router.get('/', async (req: CompanyRequest, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { companyId: req.company!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { invoices: true } },
      },
    });

    res.json(clients);
  } catch (error) {
    console.error('List clients error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/clients ───
router.post('/', async (req: CompanyRequest, res) => {
  try {
    const data = createClientSchema.parse(req.body);

    const client = await prisma.client.create({
      data: {
        ...data,
        companyId: req.company!.id,
      },
    });

    res.status(201).json(client);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── PUT /api/clients/:id ─── [NEW]
router.put('/:id', async (req: CompanyRequest, res) => {
  try {
    const id = req.params.id as string;
    const data = updateClientSchema.parse(req.body);

    // Vérifier que le client appartient à l'entreprise
    const existing = await prisma.client.findFirst({
      where: { id, companyId: req.company!.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Client non trouvé / العميل غير موجود' });
      return;
    }

    const updated = await prisma.client.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── DELETE /api/clients/:id ───
router.delete('/:id', async (req: CompanyRequest, res) => {
  try {
    const id = req.params.id as string;

    // Vérifier que le client appartient à l'entreprise
    const client = await prisma.client.findFirst({
      where: { id, companyId: req.company!.id },
    });

    if (!client) {
      res.status(404).json({ error: 'Client non trouvé / العميل غير موجود' });
      return;
    }

    await prisma.client.delete({ where: { id } });

    res.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
