import rateLimit, { type Options } from 'express-rate-limit';
import { RATE_LIMITS } from '@quizarena/shared';
import { config } from '../../config/index.js';

export const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.auth.windowMs,
  max: RATE_LIMITS.auth.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'TOO_MANY_REQUESTS', message: 'Çok fazla deneme, sonra tekrar deneyin' },
});

export const apiLimiter = rateLimit({
  windowMs: RATE_LIMITS.api.windowMs,
  max: RATE_LIMITS.api.max,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isDev,
});

export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'TOO_MANY_REQUESTS', message: 'Çok fazla istek, 1 saat sonra tekrar deneyin' },
});

export function rateLimitOptions(override: Partial<Options>): Options {
  return { standardHeaders: true, legacyHeaders: false, ...override } as Options;
}
