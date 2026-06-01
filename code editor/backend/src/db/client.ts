import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

// Prevent multiple Prisma instances in development (hot reload)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.IS_DEV ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

if (env.IS_DEV) {
  globalForPrisma.prisma = prisma;
}
