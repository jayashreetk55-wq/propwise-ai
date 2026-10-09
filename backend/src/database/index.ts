import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

declare global {
  // Prevent multiple PrismaClient instances during hot-reloads
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'test'
        ? []
        : process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export interface DatabaseHealth {
  status: 'connected' | 'disconnected';
  latencyMs?: number;
  message?: string;
}

/**
 * Non-blocking health probe for PostgreSQL database connectivity.
 * Safely resolves with status 'disconnected' if the database is offline or unreachable,
 * ensuring the application server and health endpoints never crash.
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const startTime = Date.now();
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database ping timeout after 2000ms')), 2000)
      ),
    ]);

    const latencyMs = Date.now() - startTime;
    return {
      status: 'connected',
      latencyMs,
      message: 'PostgreSQL connection active',
    };
  } catch (error) {
    logger.debug(`Database probe: ${(error as Error).message}`);
    return {
      status: 'disconnected',
      message: 'PostgreSQL unavailable or offline',
    };
  }
}

/**
 * Gracefully disconnects the Prisma client.
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Prisma database client disconnected gracefully');
  } catch (error) {
    logger.warn('Error during database disconnection:', error);
  }
}
