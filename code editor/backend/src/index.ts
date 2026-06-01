// ─────────────────────────────────────────────────────────────────────────────
// CodeForge Backend — Application Entry Point
// ─────────────────────────────────────────────────────────────────────────────

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Server as SocketIOServer } from 'socket.io';

import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './db/client';
import { redisClient } from './db/redis';

// ── Routes ────────────────────────────────────────────────────────────────────
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import fileRoutes from './routes/files';
import executionRoutes from './routes/execution';
import aiRoutes from './routes/ai';
import challengeRoutes from './routes/challenges';
import submissionRoutes from './routes/submissions';
import snippetRoutes from './routes/snippets';
import adminRoutes from './routes/admin';
import userRoutes from './routes/users';

// ── Middleware ────────────────────────────────────────────────────────────────
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';

// ── Socket Handlers ───────────────────────────────────────────────────────────
import { registerCollaborationHandlers } from './socket/collaboration';

// ─────────────────────────────────────────────────────────────────────────────

const app = express();
const httpServer = http.createServer(app);

// ── Socket.IO setup ───────────────────────────────────────────────────────────
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow Monaco editor resources
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(requestLogger);
app.use(rateLimiter);

// ── Static file serving for uploads ──────────────────────────────────────────
app.use('/uploads', express.static(env.UPLOADS_DIR));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const redisOk = redisClient.status === 'ready';
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: redisOk ? 'connected' : 'disconnected',
      },
    });
  } catch (err) {
    res.status(503).json({ status: 'error', error: String(err) });
  }
});

// ── API Routes ────────────────────────────────────────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/projects`, projectRoutes);
app.use(`${API}/files`, fileRoutes);
app.use(`${API}/execute`, executionRoutes);
app.use(`${API}/ai`, aiRoutes);
app.use(`${API}/challenges`, challengeRoutes);
app.use(`${API}/submissions`, submissionRoutes);
app.use(`${API}/snippets`, snippetRoutes);
app.use(`${API}/admin`, adminRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Error handler (must be last) ──────────────────────────────────────────────
app.use(errorHandler);

// ── Socket.IO Handlers ────────────────────────────────────────────────────────
registerCollaborationHandlers(io);

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function bootstrap() {
  try {
    // Test database connection
    try {
      await prisma.$connect();
      logger.info('✅ Database connected');
    } catch (dbErr) {
      logger.warn('⚠️ Database connection failed. Proceeding without DB (some features may fail).');
    }

    // Test Redis connection
    try {
      await redisClient.ping();
      logger.info('✅ Redis connected');
    } catch (redisErr) {
      logger.warn('⚠️ Redis connection failed. Proceeding without Redis (socket/rate limiting may fail).');
    }

    httpServer.listen(env.PORT, () => {
      logger.info(`🚀 CodeForge API running on http://localhost:${env.PORT}`);
      logger.info(`📡 Socket.IO listening on ws://localhost:${env.PORT}`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received — shutting down gracefully');
  await prisma.$disconnect();
  redisClient.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received — shutting down gracefully');
  await prisma.$disconnect();
  redisClient.disconnect();
  process.exit(0);
});

bootstrap();

export { io };
