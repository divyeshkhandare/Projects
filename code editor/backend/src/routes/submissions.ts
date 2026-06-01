import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { executeCode } from '../services/executorService';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

const router = Router();

// ── POST /api/v1/submissions — submit challenge solution ──────────────────────
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { challengeId, code, language } = z.object({
    challengeId: z.string(),
    code: z.string().min(1).max(50_000),
    language: z.enum(['javascript','typescript','python','java','c','cpp','csharp','go','php','ruby','rust']),
  }).parse(req.body);

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge || challenge.status !== 'PUBLISHED') throw new AppError('Challenge not found', 404);

  const testCases = challenge.testCases as { input: string; expected: string; isHidden: boolean }[];
  const testResults: { input: string; expected: string; actual: string; passed: boolean; hidden: boolean }[] = [];
  let passedTests = 0;

  for (const tc of testCases) {
    const result = await executeCode(language, code, tc.input, challenge.timeLimit / 1000);
    const actual = result.stdout.trim();
    const passed = actual === tc.expected.trim();
    if (passed) passedTests++;

    testResults.push({
      input: tc.isHidden ? '[hidden]' : tc.input,
      expected: tc.isHidden ? '[hidden]' : tc.expected,
      actual: tc.isHidden ? (passed ? 'Correct' : 'Wrong') : actual,
      passed,
      hidden: tc.isHidden,
    });
  }

  const totalTests = testCases.length;
  const status = passedTests === totalTests ? 'ACCEPTED' : 'WRONG_ANSWER';
  const score = passedTests === totalTests ? challenge.points : 0;

  const submission = await prisma.submission.create({
    data: {
      userId: req.user!.id,
      challengeId,
      language,
      code,
      status,
      passedTests,
      totalTests,
      score,
      testResults,
    },
  });

  res.status(201).json({
    success: true,
    data: { submission: { ...submission, testResults } },
  });
}));

// ── GET /api/v1/submissions — user's submissions ──────────────────────────────
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { challengeId, page = '1', limit = '20' } = req.query as Record<string, string>;
  const where: any = { userId: req.user!.id };
  if (challengeId) where.challengeId = challengeId;

  const submissions = await prisma.submission.findMany({
    where,
    skip: (parseInt(page) - 1) * parseInt(limit),
    take: parseInt(limit),
    orderBy: { createdAt: 'desc' },
    include: { challenge: { select: { title: true, difficulty: true } } },
  });

  res.json({ success: true, data: { submissions } });
}));

export default router;
