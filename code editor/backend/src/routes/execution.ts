import { Router } from 'express';
import { z } from 'zod';
import { executeCode } from '../services/executorService';
import { prisma } from '../db/client';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/authenticate';
import { executionLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

const executeSchema = z.object({
  language: z.enum(['javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp', 'go', 'php', 'ruby', 'rust']),
  code: z.string().min(1).max(100_000, 'Code too large (max 100KB)'),
  stdin: z.string().max(10_000).default(''),
  projectId: z.string().optional(),
});

// ── POST /api/v1/execute ──────────────────────────────────────────────────────
router.post(
  '/',
  optionalAuth,
  executionLimiter,
  asyncHandler(async (req: AuthRequest, res) => {
    const { language, code, stdin, projectId } = executeSchema.parse(req.body);

    const result = await executeCode(language, code, stdin);

    // Persist execution record
    await prisma.execution.create({
      data: {
        language,
        code,
        stdin,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        status: result.status === 'success' ? 'SUCCESS'
          : result.status === 'timeout' ? 'TIMEOUT'
            : result.status === 'compile_error' ? 'ERROR'
              : 'ERROR',
        durationMs: result.durationMs,
        userId: req.user?.id,
        projectId: projectId || null,
      },
    });

    res.json({
      success: true,
      data: {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        durationMs: result.durationMs,
        status: result.status,
        ...(result.status === 'timeout'
          ? { message: `Execution timed out after ${process.env.SANDBOX_TIMEOUT || 15} seconds` }
          : {}),
      },
    });
  })
);

// ── GET /api/v1/execute/history — get user's execution history ────────────────
router.get(
  '/history',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [executions, total] = await Promise.all([
      prisma.execution.findMany({
        where: { userId: req.user!.id },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: { id: true, language: true, status: true, durationMs: true, createdAt: true, exitCode: true },
      }),
      prisma.execution.count({ where: { userId: req.user!.id } }),
    ]);

    res.json({ success: true, data: { executions, total } });
  })
);

export default router;
