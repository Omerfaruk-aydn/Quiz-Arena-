import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/ApiError.js';

export function authorize(...roles: Array<'teacher' | 'student'>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Bu rol için izin yok', 'ROLE_FORBIDDEN'));
    }
    next();
  };
}
