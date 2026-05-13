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
const PORT = parseInt(process.env.PORT as string, 10) || 3001;

// ─── Allowed Origins ───
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.FRONTEND_URL,       // Vercel production URL
].filter(Boolean) as string[];

// ─── Security Middleware ───
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '5mb' })); // 5mb pour les logos en Base64

// ─── Trust Railway proxy ───
app.set('trust proxy', 1);

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

// ─── Health Check & Root ───
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to AccounTax API',
    status: 'online',
    version: '1.2.0'
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'AccounTax API',
    version: '1.2.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ─── Global Error Handler ───
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Server Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// ─── Start ───
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║  🚀 AccounTax API Server v1.2           ║
  ║  📡 Port: ${String(PORT).padEnd(29)}║
  ║  📦 Database: PostgreSQL (Supabase)     ║
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
