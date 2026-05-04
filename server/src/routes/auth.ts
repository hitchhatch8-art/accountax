import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { generateToken, authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// ─── Validation Schemas ───
const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe: 6 caractères minimum'),
  name: z.string().min(2, 'Nom: 2 caractères minimum'),
  companyName: z.string().min(2, 'Nom entreprise requis'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// ─── POST /api/auth/register ───
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check si email existe déjà
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      res.status(400).json({ error: 'Cet email est déjà utilisé / هذا البريد مستخدم بالفعل' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30); // 30 days free trial

    // Créer User + Company en une transaction
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        plan: 'STARTER',
        trialEndsAt,
        company: {
          create: {
            name: data.companyName,
          },
        },
      },
      include: { company: true },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        trialEndsAt: user.trialEndsAt,
        company: user.company,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erreur serveur / خطأ في الخادم' });
  }
});

// ─── POST /api/auth/login ───
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { company: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect / البريد أو كلمة المرور غير صحيحة' });
      return;
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect / البريد أو كلمة المرور غير صحيحة' });
      return;
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        trialEndsAt: user.trialEndsAt,
        company: user.company,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Données invalides' });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur serveur / خطأ في الخادم' });
  }
});

// ─── GET /api/auth/me ───
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { company: true },
    });

    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan,
      trialEndsAt: user.trialEndsAt,
      company: user.company,
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/auth/forgot-password ───
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email requis / البريد مطلوب' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 even if not found for security (no email enumeration)
      res.json({ message: 'Si l\'email existe, un code a été envoyé' });
      return;
    }

    // Generate 6 digit code
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry }
    });

    // MOCK EMAIL SENDING
    console.log(`[MOCK EMAIL] Reset code for ${email} is: ${resetToken}`);
    
    // In dev, we send it back so the user can see it in the UI
    res.json({ 
      message: 'Code généré avec succès',
      mockCode: resetToken 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Erreur serveur / خطأ في الخادم' });
  }
});

// ─── POST /api/auth/reset-password ───
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      res.status(400).json({ error: 'Données manquantes / بيانات مفقودة' });
      return;
    }
    
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Mot de passe trop court / كلمة المرور قصيرة' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { 
        email, 
        resetToken: code,
        resetTokenExpiry: { gt: new Date() } // Must not be expired
      }
    });

    if (!user) {
      res.status(400).json({ error: 'Code invalide ou expiré / الرمز غير صالح أو منتهي' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ message: 'Mot de passe réinitialisé / تم إعادة التعيين بنجاح' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Erreur serveur / خطأ في الخادم' });
  }
});

export default router;
