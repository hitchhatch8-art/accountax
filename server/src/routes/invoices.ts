import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { companyMiddleware, type CompanyRequest } from '../middleware/company.js';

const router = Router();

router.use(authMiddleware as any);
router.use(companyMiddleware as any);

// ─── Validation ───
const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.number().positive('Quantité doit être positive'),
  priceHT: z.number().min(0, 'Prix doit être positif'),
  tvaRate: z.number().min(0).max(100),
});

const createInvoiceSchema = z.object({
  number: z.string().min(1, 'Numéro de facture requis'),
  date: z.string(),
  clientId: z.string().uuid('ID client invalide'),
  currency: z.string().default('DH'),
  status: z.enum(['draft', 'pending', 'paid', 'overdue']).default('draft'),
  items: z.array(invoiceItemSchema).min(1, 'Au moins un article requis'),
});

const updateInvoiceSchema = z.object({
  number: z.string().optional(),
  date: z.string().optional(),
  clientId: z.string().uuid().optional(),
  currency: z.string().optional(),
  status: z.enum(['draft', 'pending', 'paid', 'overdue']).optional(),
  items: z.array(invoiceItemSchema).min(1).optional(),
});

// ─── Helper: calculate totals server-side ───
function calculateTotals(items: { quantity: number; priceHT: number; tvaRate: number }[]) {
  let totalHT = 0;
  let totalTVA = 0;
  for (const item of items) {
    const itemHT = item.quantity * item.priceHT;
    totalHT += itemHT;
    totalTVA += itemHT * (item.tvaRate / 100);
  }
  return { totalHT, totalTVA, totalTTC: totalHT + totalTVA };
}

// ─── GET /api/invoices ───
router.get('/', async (req: CompanyRequest, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { companyId: req.company!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { name: true, ice: true } },
        items: true,
      },
    });

    // Transformer pour correspondre au format Frontend
    const formatted = invoices.map((inv: any) => ({
      id: inv.id,
      number: inv.number,
      date: inv.date,
      clientId: inv.clientId,
      clientName: inv.client.name,
      items: inv.items,
      totalHT: inv.totalHT,
      totalTVA: inv.totalTVA,
      totalTTC: inv.totalTTC,
      status: inv.status,
      currency: inv.currency,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('List invoices error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/invoices ───
router.post('/', async (req: CompanyRequest, res) => {
  try {
    const data = createInvoiceSchema.parse(req.body);

    // Calculer les totaux côté serveur (sécurité)
    const { totalHT, totalTVA, totalTTC } = calculateTotals(data.items);

    const invoice = await prisma.invoice.create({
      data: {
        number: data.number,
        date: data.date,
        status: data.status,
        currency: data.currency,
        totalHT,
        totalTVA,
        totalTTC,
        clientId: data.clientId,
        companyId: req.company!.id,
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            priceHT: item.priceHT,
            tvaRate: item.tvaRate,
          })),
        },
      },
      include: {
        client: { select: { name: true } },
        items: true,
      },
    });

    res.status(201).json({
      ...invoice,
      clientName: invoice.client.name,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── PUT /api/invoices/:id ─── [NEW]
router.put('/:id', async (req: CompanyRequest, res) => {
  try {
    const id = req.params.id as string;
    const data = updateInvoiceSchema.parse(req.body);

    // ✅ Vérifier que la facture appartient à l'entreprise (IDOR fix)
    const existing = await prisma.invoice.findFirst({
      where: { id, companyId: req.company!.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Facture non trouvée / الفاتورة غير موجودة' });
      return;
    }

    // Si les items sont fournis, recalculer les totaux et remplacer
    if (data.items) {
      const { totalHT, totalTVA, totalTTC } = calculateTotals(data.items);

      // Supprimer anciennes lignes et recréer
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: id as string } });

      const updated = await prisma.invoice.update({
        where: { id },
        data: {
          ...(data.number && { number: data.number }),
          ...(data.date && { date: data.date }),
          ...(data.clientId && { clientId: data.clientId }),
          ...(data.currency && { currency: data.currency }),
          ...(data.status && { status: data.status }),
          totalHT,
          totalTVA,
          totalTTC,
          items: {
            create: data.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              priceHT: item.priceHT,
              tvaRate: item.tvaRate,
            })),
          },
        },
        include: { client: { select: { name: true } }, items: true },
      });

      res.json({ ...updated, clientName: updated.client.name });
    } else {
      // Mise à jour simple (sans items)
      const updated = await prisma.invoice.update({
        where: { id },
        data: {
          ...(data.number && { number: data.number }),
          ...(data.date && { date: data.date }),
          ...(data.clientId && { clientId: data.clientId }),
          ...(data.currency && { currency: data.currency }),
          ...(data.status && { status: data.status }),
        },
        include: { client: { select: { name: true } }, items: true },
      });

      res.json({ ...updated, clientName: updated.client.name });
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── PATCH /api/invoices/:id/status ───
router.patch('/:id/status', async (req: CompanyRequest, res) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const validStatuses = ['draft', 'pending', 'paid', 'overdue'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Statut invalide' });
      return;
    }

    // ✅ Vérifier que la facture appartient à l'entreprise (IDOR fix)
    const existing = await prisma.invoice.findFirst({
      where: { id, companyId: req.company!.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Facture non trouvée / الفاتورة غير موجودة' });
      return;
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status },
    });

    res.json(invoice);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── DELETE /api/invoices/:id ───
router.delete('/:id', async (req: CompanyRequest, res) => {
  try {
    const id = req.params.id as string;

    // ✅ Vérifier que la facture appartient à l'entreprise (IDOR fix)
    const existing = await prisma.invoice.findFirst({
      where: { id, companyId: req.company!.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Facture non trouvée / الفاتورة غير موجودة' });
      return;
    }

    await prisma.invoice.delete({ where: { id } });

    res.json({ message: 'Facture supprimée avec succès' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
