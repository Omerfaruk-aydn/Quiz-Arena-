import { createServer } from 'http';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { getRedisClient, disconnectRedis } from './config/redis.js';
import { logger } from './utils/logger.js';
import { setupSocketServer } from './socket/index.js';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  getRedisClient();

  const app = createApp();
  const httpServer = createServer(app);

  setupSocketServer(httpServer);

  httpServer.listen(config.port, () => {
    logger.info(`🚀 QuizArena sunucusu http://localhost:${config.port}`);
    logger.info(`📡 Socket.io /game namespace hazır`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} alındı, kapatılıyor...`);
    httpServer.close();
    await disconnectRedis();
    await disconnectDatabase();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error('Bootstrap hatası', err);
  process.exit(1);
});
