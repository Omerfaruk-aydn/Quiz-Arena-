import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export function verifyTokenForSocket(token: string): Promise<{ sub: string } | null> {
  return new Promise((resolve) => {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as { sub: string; type?: string };
      if (payload.type && payload.type !== 'access') return resolve(null);
      resolve({ sub: payload.sub });
    } catch {
      resolve(null);
    }
  });
}
