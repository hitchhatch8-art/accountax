import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import prisma from './lib/prisma.js';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import invoiceRoutes from './routes/invoices.js';
import companyRoutes from './routes/company.js';
import expensesRoutes from './routes/expenses.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security Middleware ───
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
}));
app.use(express.json({ limit: '5mb' })); // 5mb pour les logos en Base64

// ─── Rate Limiting ───
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 tentatives max par IP
  message: { error: 'Trop de tentatives, réessayez dans 15 minutes / الكثير من المحاولات، أعد المحاولة بعد 15 دقيقة' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 req/min per IP
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// ─── Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/expenses', expensesRoutes);

// ─── Health Check ───
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'AccounTax API',
    version: '1.1.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Global Error Handler ───
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Server Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// ─── Start ───
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║  🚀 AccounTax API Server v1.1           ║
  ║  📡 http://localhost:${PORT}              ║
  ║  📦 Database: SQLite (Prisma ORM)       ║
  ║  🔐 Auth: JWT + bcrypt                  ║
  ║  🛡️  Security: Helmet + Rate Limiting    ║
  ╚══════════════════════════════════════════╝
  `);
});

// ─── Graceful Shutdown ───
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
