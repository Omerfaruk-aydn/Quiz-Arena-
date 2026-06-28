import { prisma } from './prisma.js';
import { logger } from '../utils/logger.js';

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('✅ PostgreSQL bağlantısı kuruldu');
  } catch (err) {
    logger.error('❌ PostgreSQL bağlantı hatası', err);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
