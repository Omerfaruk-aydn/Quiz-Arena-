import { Redis, type RedisOptions } from 'ioredis';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    const options: RedisOptions = {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    };
    redisClient = new Redis(config.redis.url, options);

    redisClient.on('connect', () => {
      logger.info('Redis baglantisi kuruldu');
    });

    redisClient.on('error', (err: Error) => {
      logger.error('Redis hata', err);
    });

    redisClient.on('close', () => {
      logger.warn('Redis baglantisi kapandi');
    });
  }
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
