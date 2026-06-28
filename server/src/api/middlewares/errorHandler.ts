import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { config } from '../../config/index.js';

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ code: 'NOT_FOUND', message: `${req.method} ${req.path} bulunamadı` });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Sunucu hatası';
  let details: unknown;

  if (err instanceof ApiError) {
    status = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Doğrulama hatası';
    details = err.flatten();
  } else if (err instanceof Error) {
    message = err.message;
    if (config.isDev) details = err.stack;
  }

  if (status >= 500) {
    logger.error('Unhandled error', { path: req.path, method: req.method, err });
  } else if (config.isDev) {
    logger.warn('Client error', { path: req.path, method: req.method, code, message });
  }

  res.status(status).json({ code, message, ...(details ? { details } : {}) });
}
