import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { authenticate, AuthRequest, requireRole } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

const router = Router();

// ── GET /api/v1/challenges ────────────────────────────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
  const { difficulty, language, search, page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = { status: 'PUBLISHED' };
  if (difficulty) where.difficulty = difficulty;
  if (language) where.language = language;
  if (search) where.OR = [
    { title: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
  ];

  const [challenges, total] = await Promise.all([
    prisma.challenge.findMany({
      where, skip, take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, slug: true, difficulty: true, language: true, points: true, tags: true, _count: { select: { submissions: true } } },
    }),
    prisma.challenge.count({ where }),
  ]);

  res.json({ success: true, data: { challenges, total } });
}));

// ── GET /api/v1/challenges/:slug ──────────────────────────────────────────────
router.get('/:slug', asyncHandler(async (req, res) => {
  const challenge = await prisma.challenge.findUnique({
    where: { slug: req.params.slug },
    select: {
      id: true, title: true, description: true, difficulty: true, language: true,
      starterCode: true, testCases: true, points: true, tags: true, timeLimit: true,
      memoryLimit: true, _count: { select: { submissions: true } },
    },
  });
  if (!challenge) throw new AppError('Challenge not found', 404);
  res.json({ success: true, data: { challenge } });
}));

// ── POST /api/v1/challenges — admin only ──────────────────────────────────────
router.post('/', authenticate, requireRole('ADMIN', 'MODERATOR'), asyncHandler(async (req: AuthRequest, res) => {
  const schema = z.object({
    title: z.string().min(1).max(200),
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
    description: z.string().min(1),
    difficulty: z.enum(['EASY','MEDIUM','HARD','EXPERT']),
    language: z.enum(['javascript','typescript','python','java','c','cpp','csharp','go','php','ruby','rust']),
    starterCode: z.string().default(''),
    solutionCode: z.string().optional(),
    testCases: z.array(z.object({ input: z.string(), expected: z.string(), isHidden: z.boolean().default(false) })),
    tags: z.array(z.string()).default([]),
    points: z.number().int().min(1).default(10),
    timeLimit: z.number().int().default(5000),
    memoryLimit: z.number().int().default(256),
  });

  const data = schema.parse(req.body);
  const challenge = await prisma.challenge.create({ data: { ...data, authorId: req.user!.id } });
  res.status(201).json({ success: true, data: { challenge } });
}));

export default router;
