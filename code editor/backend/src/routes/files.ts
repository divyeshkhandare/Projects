import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

const router = Router();

const upsertFileSchema = z.object({
  name: z.string().min(1).max(255),
  path: z.string().min(1),
  content: z.string().default(''),
  language: z.enum(['javascript','typescript','python','java','c','cpp','csharp','go','php','ruby','rust']).default('javascript'),
  isFolder: z.boolean().default(false),
  parentId: z.string().optional(),
});

/** Check if user has write access to a project */
async function assertWriteAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborations: true },
  });
  if (!project) throw new AppError('Project not found', 404);
  const isOwner = project.userId === userId;
  const isEditor = project.collaborations.some(
    (c) => c.userId === userId && c.permission === 'EDITOR'
  );
  if (!isOwner && !isEditor) throw new AppError('Write access denied', 403);
  return project;
}

// ── GET /api/v1/files/project/:projectId ─────────────────────────────────────
router.get(
  '/project/:projectId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const files = await prisma.file.findMany({
      where: { projectId: req.params.projectId },
      orderBy: [{ isFolder: 'desc' }, { path: 'asc' }],
    });
    res.json({ success: true, data: { files } });
  })
);

// ── GET /api/v1/files/:id ─────────────────────────────────────────────────────
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) throw new AppError('File not found', 404);
    res.json({ success: true, data: { file } });
  })
);

// ── POST /api/v1/files — create file ─────────────────────────────────────────
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { projectId, ...data } = z.object({
      projectId: z.string(),
      ...upsertFileSchema.shape,
    }).parse(req.body);

    await assertWriteAccess(projectId, req.user!.id);

    const file = await prisma.file.create({ data: { projectId, ...data } });
    res.status(201).json({ success: true, message: 'File created', data: { file } });
  })
);

// ── PATCH /api/v1/files/:id — update file content ────────────────────────────
router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) throw new AppError('File not found', 404);

    await assertWriteAccess(file.projectId, req.user!.id);

    const { content, name } = z.object({
      content: z.string().optional(),
      name: z.string().optional(),
    }).parse(req.body);

    const updated = await prisma.file.update({
      where: { id: req.params.id },
      data: {
        ...(content !== undefined ? { content, size: Buffer.byteLength(content, 'utf8') } : {}),
        ...(name ? { name } : {}),
      },
    });

    // Update project's updatedAt
    await prisma.project.update({
      where: { id: file.projectId },
      data: { updatedAt: new Date() },
    });

    res.json({ success: true, message: 'File updated', data: { file: updated } });
  })
);

// ── DELETE /api/v1/files/:id — delete file ────────────────────────────────────
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) throw new AppError('File not found', 404);

    await assertWriteAccess(file.projectId, req.user!.id);

    // If folder, delete all children
    if (file.isFolder) {
      await prisma.file.deleteMany({ where: { path: { startsWith: file.path + '/' } } });
    }

    await prisma.file.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'File deleted' });
  })
);

export default router;
