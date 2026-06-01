import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import archiver from 'archiver';

const router = Router();

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  language: z.enum(['javascript','typescript','python','java','c','cpp','csharp','go','php','ruby','rust']).default('javascript'),
  visibility: z.enum(['PUBLIC','PRIVATE','UNLISTED']).default('PRIVATE'),
  isTemplate: z.boolean().default(false),
});

const updateProjectSchema = createProjectSchema.partial();

// ── GET /api/v1/projects — list user's projects ───────────────────────────────
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { page = '1', limit = '20', search, language, visibility } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {
      OR: [
        { userId: req.user!.id },
        { collaborations: { some: { userId: req.user!.id } } },
      ],
    };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (language) where.language = language;
    if (visibility) where.visibility = visibility;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          user: { select: { id: true, username: true, avatar: true } },
          _count: { select: { files: true, collaborations: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      success: true,
      data: { projects, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } },
    });
  })
);

// ── GET /api/v1/projects/public — browse public projects ─────────────────────
router.get(
  '/public',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { page = '1', limit = '20', search, language } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = { visibility: 'PUBLIC' };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (language) where.language = language;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { starCount: 'desc' },
        include: {
          user: { select: { id: true, username: true, avatar: true } },
          _count: { select: { files: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    res.json({ success: true, data: { projects, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } } });
  })
);

// ── POST /api/v1/projects — create project ────────────────────────────────────
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const data = createProjectSchema.parse(req.body);
    const project = await prisma.project.create({
      data: { ...data, userId: req.user!.id },
    });

    // Create a default main file
    const ext: Record<string, string> = {
      javascript: 'js', typescript: 'ts', python: 'py', java: 'java',
      c: 'c', cpp: 'cpp', csharp: 'cs', go: 'go', php: 'php', ruby: 'rb', rust: 'rs',
    };
    const starterCode: Record<string, string> = {
      javascript: '// Welcome to CodeForge!\nconsole.log("Hello, World!");\n',
      typescript: '// Welcome to CodeForge!\nconst greeting: string = "Hello, World!";\nconsole.log(greeting);\n',
      python: '# Welcome to CodeForge!\nprint("Hello, World!")\n',
      java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n',
      c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n',
      cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n',
      csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}\n',
      go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n',
      php: '<?php\necho "Hello, World!";\n',
      ruby: 'puts "Hello, World!"\n',
      rust: 'fn main() {\n    println!("Hello, World!");\n}\n',
    };

    const filename = data.language === 'java' ? 'Main' : 'main';
    await prisma.file.create({
      data: {
        projectId: project.id,
        name: `${filename}.${ext[data.language]}`,
        path: `${filename}.${ext[data.language]}`,
        content: starterCode[data.language] || '',
        language: data.language,
      },
    });

    res.status(201).json({ success: true, message: 'Project created', data: { project } });
  })
);

// ── GET /api/v1/projects/:id — get project ────────────────────────────────────
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, username: true, name: true, avatar: true } },
        files: { orderBy: [{ isFolder: 'desc' }, { name: 'asc' }] },
        collaborations: {
          include: { user: { select: { id: true, username: true, avatar: true } } },
        },
        _count: { select: { executions: true } },
      },
    });

    if (!project) throw new AppError('Project not found', 404);

    // Check access
    const isOwner = req.user?.id === project.userId;
    const isCollaborator = project.collaborations.some((c) => c.userId === req.user?.id);
    const isPublic = project.visibility === 'PUBLIC';

    if (!isPublic && !isOwner && !isCollaborator) {
      throw new AppError('You do not have access to this project', 403);
    }

    res.json({ success: true, data: { project, isOwner, isCollaborator } });
  })
);

// ── PATCH /api/v1/projects/:id — update project ───────────────────────────────
router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) throw new AppError('Project not found', 404);
    if (project.userId !== req.user!.id) throw new AppError('Access denied', 403);

    const data = updateProjectSchema.parse(req.body);
    const updated = await prisma.project.update({ where: { id: req.params.id }, data });
    res.json({ success: true, message: 'Project updated', data: { project: updated } });
  })
);

// ── DELETE /api/v1/projects/:id — delete project ─────────────────────────────
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) throw new AppError('Project not found', 404);
    if (project.userId !== req.user!.id) throw new AppError('Access denied', 403);

    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Project deleted' });
  })
);

// ── POST /api/v1/projects/:id/fork — fork/clone a project ────────────────────
router.post(
  '/:id/fork',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const source = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { files: true },
    });

    if (!source) throw new AppError('Project not found', 404);
    if (source.visibility === 'PRIVATE' && source.userId !== req.user!.id) {
      throw new AppError('Cannot fork a private project', 403);
    }

    const forked = await prisma.project.create({
      data: {
        name: `${source.name} (fork)`,
        description: source.description,
        language: source.language,
        visibility: 'PRIVATE',
        userId: req.user!.id,
        forkedFromId: source.id,
        files: {
          create: source.files.map((f) => ({
            name: f.name,
            path: f.path,
            content: f.content,
            language: f.language,
            isFolder: f.isFolder,
          })),
        },
      },
    });

    // Increment fork count
    await prisma.project.update({ where: { id: source.id }, data: { forkCount: { increment: 1 } } });

    res.status(201).json({ success: true, message: 'Project forked', data: { project: forked } });
  })
);

// ── GET /api/v1/projects/:id/download — download project as ZIP ──────────────
router.get(
  '/:id/download',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { files: true },
    });

    if (!project) throw new AppError('Project not found', 404);
    if (project.userId !== req.user!.id) throw new AppError('Access denied', 403);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${project.name}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const file of project.files) {
      if (!file.isFolder) {
        archive.append(file.content, { name: file.path });
      }
    }

    await archive.finalize();
  })
);

// ── POST /api/v1/projects/:id/collaborators — add collaborator ────────────────
router.post(
  '/:id/collaborators',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { username, permission } = z.object({
      username: z.string(),
      permission: z.enum(['EDITOR', 'VIEWER']).default('VIEWER'),
    }).parse(req.body);

    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) throw new AppError('Project not found', 404);
    if (project.userId !== req.user!.id) throw new AppError('Only the owner can add collaborators', 403);

    const targetUser = await prisma.user.findUnique({ where: { username } });
    if (!targetUser) throw new AppError('User not found', 404);

    const collab = await prisma.collaboration.upsert({
      where: { projectId_userId: { projectId: project.id, userId: targetUser.id } },
      create: { projectId: project.id, userId: targetUser.id, permission, invitedBy: req.user!.id },
      update: { permission },
    });

    res.json({ success: true, message: 'Collaborator added', data: { collaboration: collab } });
  })
);

export default router;
