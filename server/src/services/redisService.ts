import type { Redis } from 'ioredis';
import { getRedisClient } from '../config/redis.js';

const TOKEN_BLACKLIST_PREFIX = 'bl:token:';
const GAME_STATE_PREFIX = 'game:state:';
const TTL_7_DAYS = 7 * 24 * 60 * 60;

export async function blacklistToken(jti: string, expiresInSeconds: number): Promise<void> {
  const client = getRedisClient();
  await client.set(`${TOKEN_BLACKLIST_PREFIX}${jti}`, '1', 'EX', expiresInSeconds);
}

export async function isTokenBlacklisted(jti: string): Promise<boolean> {
  const client = getRedisClient();
  const v = await client.get(`${TOKEN_BLACKLIST_PREFIX}${jti}`);
  return v === '1';
}

export async function setGameState<T>(pin: string, state: T, ttl = TTL_7_DAYS): Promise<void> {
  const client = getRedisClient();
  await client.set(`${GAME_STATE_PREFIX}${pin}`, JSON.stringify(state), 'EX', ttl);
}

export async function getGameState<T>(pin: string): Promise<T | null> {
  const client = getRedisClient();
  const v = await client.get(`${GAME_STATE_PREFIX}${pin}`);
  return v ? (JSON.parse(v) as T) : null;
}

export async function deleteGameState(pin: string): Promise<void> {
  const client = getRedisClient();
  await client.del(`${GAME_STATE_PREFIX}${pin}`);
}

export function redisClient(): Redis {
  return getRedisClient();
}
