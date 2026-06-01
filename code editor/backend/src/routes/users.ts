import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// ── GET /api/v1/users/:username/profile ───────────────────────────────────────
router.get('/:username/profile', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
    select: {
      id: true, username: true, name: true, avatar: true, bio: true, createdAt: true,
      _count: { select: { projects: true, submissions: true } },
      projects: {
        where: { visibility: 'PUBLIC' },
        take: 6,
        orderBy: { updatedAt: 'desc' },
        select: { id: true, name: true, description: true, language: true, updatedAt: true },
      },
    },
  });

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: { user } });
}));

// ── PATCH /api/v1/users/profile — update own profile ─────────────────────────
router.patch('/profile', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { name, bio, avatar } = z.object({
    name: z.string().min(1).max(100).optional(),
    bio: z.string().max(500).optional(),
    avatar: z.string().url().optional(),
  }).parse(req.body);

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { ...(name ? { name } : {}), ...(bio !== undefined ? { bio } : {}), ...(avatar ? { avatar } : {}) },
    select: { id: true, email: true, username: true, name: true, avatar: true, bio: true },
  });

  res.json({ success: true, data: { user } });
}));

// ── GET /api/v1/users/me/stats — personal stats ───────────────────────────────
router.get('/me/stats', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const [projectCount, executionCount, submissionCount, acceptedCount] = await Promise.all([
    prisma.project.count({ where: { userId: req.user!.id } }),
    prisma.execution.count({ where: { userId: req.user!.id } }),
    prisma.submission.count({ where: { userId: req.user!.id } }),
    prisma.submission.count({ where: { userId: req.user!.id, status: 'ACCEPTED' } }),
  ]);

  res.json({
    success: true,
    data: { projectCount, executionCount, submissionCount, acceptedCount, acceptanceRate: submissionCount ? Math.round((acceptedCount / submissionCount) * 100) : 0 },
  });
}));

export default router;
