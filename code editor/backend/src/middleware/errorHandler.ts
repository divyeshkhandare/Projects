import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Known operational errors
  if (err instanceof AppError) {
    logger.warn(`AppError [${err.statusCode}]: ${err.message}`, { path: req.path });
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.data ? { data: err.data } : {}),
    });
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Validation error',
      errors: err.flatten().fieldErrors,
    });
  }

  // Prisma unique constraint violations
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = (err.meta?.target as string[])?.join(', ');
      return res.status(409).json({
        success: false,
        message: `A record with this ${fields} already exists.`,
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
  }

  // Unknown errors
  logger.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}
