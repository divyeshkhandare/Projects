import { Router } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { authLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// ── Validation Schemas ────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  name: z.string().min(1).max(100),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ── POST /api/v1/auth/register ────────────────────────────────────────────────
router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const { user, tokens } = await authService.register(data);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user, accessToken: tokens.accessToken },
    });
  })
);

// ── POST /api/v1/auth/login ───────────────────────────────────────────────────
router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const { user, tokens } = await authService.login(email, password);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: { user, accessToken: tokens.accessToken },
    });
  })
);

// ── POST /api/v1/auth/google ──────────────────────────────────────────────────
router.post(
  '/google',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { idToken } = z.object({ idToken: z.string() }).parse(req.body);
    const { user, tokens } = await authService.googleLogin(idToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Google login successful',
      data: { user, accessToken: tokens.accessToken },
    });
  })
);

// ── POST /api/v1/auth/refresh ─────────────────────────────────────────────────
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const tokens = await authService.refreshAccessToken(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, data: { accessToken: tokens.accessToken } });
  })
);

// ── POST /api/v1/auth/logout ──────────────────────────────────────────────────
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const token = req.headers.authorization?.slice(7) || '';
    await authService.logout(req.user!.id, token);
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  })
);

// ── GET /api/v1/auth/me ───────────────────────────────────────────────────────
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await import('../db/client').then(({ prisma }) =>
      prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true, email: true, username: true, name: true,
          avatar: true, bio: true, role: true, createdAt: true,
          _count: { select: { projects: true, submissions: true } },
        },
      })
    );
    res.json({ success: true, data: { user } });
  })
);

// ── POST /api/v1/auth/forgot-password ────────────────────────────────────────
router.post(
  '/forgot-password',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    await authService.forgotPassword(email);
    // Always return success to prevent email enumeration
    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  })
);

// ── POST /api/v1/auth/reset-password ─────────────────────────────────────────
router.post(
  '/reset-password',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { token, password } = z.object({
      token: z.string(),
      password: z.string().min(8),
    }).parse(req.body);

    await authService.resetPassword(token, password);
    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  })
);

export default router;
