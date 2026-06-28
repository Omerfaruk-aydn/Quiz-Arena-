import type { NextFunction, Request, Response, RequestHandler } from 'express';
import { ApiError } from './ApiError.js';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(fn: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err: unknown) => {
      if (err instanceof ApiError) return next(err);
      next(err);
    });
  };
}
