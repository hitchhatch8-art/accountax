import { PrismaClient } from '@prisma/client';

// Singleton Prisma instance — avoids multiple connections during dev hot-reload
const prisma = new PrismaClient();

export default prisma;
