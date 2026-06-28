import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../services/authService.js';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import type { AuthenticatedUser } from '../../types/express.d.js';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Token gerekli', 'NO_TOKEN');
    }
    const token = header.slice(7);
    const { sub } = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: sub },
      select: { id: true, role: true, name: true, email: true },
    });
    if (!user) throw ApiError.unauthorized('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
    req.user = {
      _id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    } satisfies AuthenticatedUser;
    next();
  } catch (err) {
    next(err);
  }
}

export function authenticateOptional(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  const token = header.slice(7);
  try {
    const { sub } = verifyAccessToken(token);
    void sub;
    void next();
  } catch {
    next();
  }
}
