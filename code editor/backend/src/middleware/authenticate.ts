import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../db/client';
import { isTokenBlacklisted } from '../db/redis';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    username: string;
  };
}

/** Verify JWT and attach user to request */
export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies?.accessToken;

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    // Check blacklist (for logged-out tokens)
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      throw new AppError('Token has been revoked', 401);
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      username: string;
    };

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, username: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new AppError('User not found or deactivated', 401);
    }

    req.user = { id: user.id, email: user.email, role: user.role, username: user.username };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401));
    } else if (err instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(err);
    }
  }
}

/** Optional authentication — attaches user if token present, but doesn't block */
export async function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies?.accessToken;

  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      username: string;
    };
    req.user = payload;
  } catch {
    // Silently ignore invalid tokens for optional auth
  }
  next();
}

/** Require specific roles */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
}
