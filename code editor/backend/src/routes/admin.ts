import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, requireRole('ADMIN'));

// ── GET /api/v1/admin/stats — dashboard stats ─────────────────────────────────
router.get('/stats', asyncHandler(async (_req, res) => {
  const [totalUsers, totalProjects, totalExecutions, recentUsers, languageStats] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.execution.count(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, name: true, email: true, role: true, createdAt: true, lastLoginAt: true },
    }),
    prisma.execution.groupBy({
      by: ['language'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
  ]);

  res.json({
    success: true,
    data: {
      stats: { totalUsers, totalProjects, totalExecutions },
      recentUsers,
      languageStats: languageStats.map((s) => ({ language: s.language, count: s._count.id })),
    },
  });
}));

// ── GET /api/v1/admin/users — list all users ──────────────────────────────────
router.get('/users', asyncHandler(async (req, res) => {
  const { page = '1', limit = '20', search, role } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where: any = {};
  if (search) where.OR = [
    { email: { contains: search, mode: 'insensitive' } },
    { username: { contains: search, mode: 'insensitive' } },
  ];
  if (role) where.role = role;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, username: true, name: true, role: true,
        isActive: true, createdAt: true, lastLoginAt: true,
        _count: { select: { projects: true, executions: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ success: true, data: { users, total } });
}));

// ── PATCH /api/v1/admin/users/:id — update user role/status ──────────────────
router.patch('/users/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { role, isActive } = z.object({
    role: z.enum(['USER','ADMIN','MODERATOR']).optional(),
    isActive: z.boolean().optional(),
  }).parse(req.body);

  // Prevent self-demotion
  if (req.params.id === req.user!.id && role && role !== 'ADMIN') {
    return res.status(400).json({ success: false, message: 'Cannot change your own admin role' });
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { ...(role ? { role } : {}), ...(isActive !== undefined ? { isActive } : {}) },
    select: { id: true, email: true, username: true, role: true, isActive: true },
  });

  res.json({ success: true, data: { user } });
}));

// ── DELETE /api/v1/admin/users/:id — delete user ──────────────────────────────
router.delete('/users/:id', asyncHandler(async (req: AuthRequest, res) => {
  if (req.params.id === req.user!.id) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
  }
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'User deleted' });
}));

// ── GET /api/v1/admin/executions — recent executions ─────────────────────────
router.get('/executions', asyncHandler(async (_req, res) => {
  const executions = await prisma.execution.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: { select: { username: true } } },
  });
  res.json({ success: true, data: { executions } });
}));

export default router;
