import { NextFunction, Request, Response } from 'express';

/**
 * Wraps async route handlers to forward errors to Express error handler.
 * Eliminates the need for try/catch in every route.
 */
export function asyncHandler(
  fn: (req: Request | any, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
