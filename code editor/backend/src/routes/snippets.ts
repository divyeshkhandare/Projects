import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

const snippetSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  code: z.string().min(1).max(50_000),
  language: z.enum(['javascript','typescript','python','java','c','cpp','csharp','go','php','ruby','rust']),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string().max(30)).max(10).default([]),
});

// ── GET /api/v1/snippets/public ───────────────────────────────────────────────
router.get('/public', optionalAuth, asyncHandler(async (req, res) => {
  const { search, language, page = '1', limit = '20' } = req.query as Record<string, string>;
  const where: any = { isPublic: true };
  if (language) where.language = language;
  if (search) where.OR = [
    { title: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
  ];

  const snippets = await prisma.snippet.findMany({
    where, skip: (parseInt(page) - 1) * parseInt(limit), take: parseInt(limit),
    orderBy: { viewCount: 'desc' },
    include: { user: { select: { username: true, avatar: true } } },
  });

  res.json({ success: true, data: { snippets } });
}));

// ── GET /api/v1/snippets/mine ─────────────────────────────────────────────────
router.get('/mine', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const snippets = await prisma.snippet.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: { snippets } });
}));

// ── POST /api/v1/snippets ─────────────────────────────────────────────────────
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const data = snippetSchema.parse(req.body);
  const snippet = await prisma.snippet.create({ data: { ...data, userId: req.user!.id } });
  res.status(201).json({ success: true, data: { snippet } });
}));

// ── GET /api/v1/snippets/:id ──────────────────────────────────────────────────
router.get('/:id', optionalAuth, asyncHandler(async (req: AuthRequest, res) => {
  const snippet = await prisma.snippet.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { username: true, avatar: true } } },
  });

  if (!snippet) return res.status(404).json({ success: false, message: 'Snippet not found' });
  if (!snippet.isPublic && snippet.userId !== req.user?.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  await prisma.snippet.update({ where: { id: snippet.id }, data: { viewCount: { increment: 1 } } });
  res.json({ success: true, data: { snippet } });
}));

// ── DELETE /api/v1/snippets/:id ───────────────────────────────────────────────
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const snippet = await prisma.snippet.findUnique({ where: { id: req.params.id } });
  if (!snippet || snippet.userId !== req.user!.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  await prisma.snippet.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Snippet deleted' });
}));

export default router;
