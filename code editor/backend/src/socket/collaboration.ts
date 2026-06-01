// ─────────────────────────────────────────────────────────────────────────────
// Socket.IO Real-time Collaboration Handler
// Manages room-based collaborative editing sessions
// ─────────────────────────────────────────────────────────────────────────────

import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../db/client';
import { redisClient } from '../db/redis';
import { logger } from '../utils/logger';

interface RoomUser {
  id: string;
  username: string;
  avatar?: string;
  color: string;
  cursor?: { lineNumber: number; column: number };
  selection?: { startLine: number; startColumn: number; endLine: number; endColumn: number };
}

// Assign unique colors to collaborators
const CURSOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

function getColor(index: number): string {
  return CURSOR_COLORS[index % CURSOR_COLORS.length];
}

export function registerCollaborationHandlers(io: Server) {
  // Auth middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (token) {
        const payload = jwt.verify(token, env.JWT_SECRET) as {
          id: string; username: string;
        };
        (socket as any).userId = payload.id;
        (socket as any).username = payload.username;
      }
      next();
    } catch {
      // Allow unauthenticated socket connections (read-only for public projects)
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string | undefined;
    const username = (socket as any).username as string | undefined;

    logger.debug(`Socket connected: ${socket.id} (user: ${username || 'anonymous'})`);

    // ── Join a project room ────────────────────────────────────────────────
    socket.on('room:join', async ({ projectId }: { projectId: string }) => {
      try {
        // Verify project access
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          include: { collaborations: true },
        });

        if (!project) {
          socket.emit('error', { message: 'Project not found' });
          return;
        }

        const isPublic = project.visibility === 'PUBLIC';
        const isOwner = project.userId === userId;
        const isCollaborator = project.collaborations.some((c) => c.userId === userId);

        if (!isPublic && !isOwner && !isCollaborator) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        await socket.join(projectId);

        let userIndex = 0;
        const roomKey = `room:${projectId}:users`;
        const roomUser: RoomUser = {
          id: userId || socket.id,
          username: username || `Guest-${socket.id.slice(0, 4)}`,
          color: '',
        };

        try {
          // Track users in room via Redis
          userIndex = await redisClient.hlen(roomKey);
          roomUser.color = getColor(userIndex);
          await redisClient.hset(roomKey, socket.id, JSON.stringify(roomUser));
          await redisClient.expire(roomKey, 3600);
        } catch {
          roomUser.color = getColor(Math.floor(Math.random() * 10)); // Fallback color
        }

        // Broadcast updated user list
        const allUsers = await getRoomUsers(projectId);
        if (!allUsers.some(u => u.id === roomUser.id)) {
           allUsers.push(roomUser); // Fallback if Redis is offline
        }
        
        io.to(projectId).emit('room:users', { users: allUsers });

        // Notify others
        socket.to(projectId).emit('room:user-joined', { user: roomUser });

        logger.debug(`User ${username} joined room ${projectId}`);
      } catch (err) {
        logger.error('Error joining room:', err);
      }
    });

    // ── Leave room ─────────────────────────────────────────────────────────
    socket.on('room:leave', async ({ projectId }: { projectId: string }) => {
      try {
        await leaveRoom(socket, projectId, io);
      } catch (err) {
        logger.error('Error leaving room:', err);
      }
    });

    // ── Code changes (OT-style delta) ──────────────────────────────────────
    socket.on('editor:change', async ({ projectId, fileId, changes, version }: {
      projectId: string;
      fileId: string;
      changes: unknown; // Monaco IModelContentChangedEvent
      version: number;
    }) => {
      // Broadcast to all other users in the room
      socket.to(projectId).emit('editor:change', {
        fileId,
        changes,
        version,
        userId: userId || socket.id,
      });
    });

    // ── Cursor position update ─────────────────────────────────────────────
    socket.on('editor:cursor', async ({ projectId, fileId, position }: {
      projectId: string;
      fileId: string;
      position: { lineNumber: number; column: number };
    }) => {
      try {
        const roomKey = `room:${projectId}:users`;
        const userData = await redisClient.hget(roomKey, socket.id);
        if (userData) {
          const user: RoomUser = JSON.parse(userData);
          user.cursor = position;
          await redisClient.hset(roomKey, socket.id, JSON.stringify(user));
        }
      } catch (err) {
        // Ignore redis errors
      }

      socket.to(projectId).emit('editor:cursor', {
        socketId: socket.id,
        userId: userId || socket.id,
        fileId,
        position,
      });
    });

    // ── Selection update ───────────────────────────────────────────────────
    socket.on('editor:selection', ({ projectId, fileId, selection }: {
      projectId: string;
      fileId: string;
      selection: { startLine: number; startColumn: number; endLine: number; endColumn: number };
    }) => {
      socket.to(projectId).emit('editor:selection', {
        socketId: socket.id,
        userId: userId || socket.id,
        fileId,
        selection,
      });
    });

    // ── File saved ─────────────────────────────────────────────────────────
    socket.on('file:saved', ({ projectId, fileId }: { projectId: string; fileId: string }) => {
      socket.to(projectId).emit('file:saved', { fileId, userId: userId || socket.id });
    });

    // ── Active file changed ────────────────────────────────────────────────
    socket.on('file:active', ({ projectId, fileId }: { projectId: string; fileId: string }) => {
      socket.to(projectId).emit('file:active', {
        socketId: socket.id,
        userId: userId || socket.id,
        fileId,
      });
    });

    // ── Chat messages within a project room ────────────────────────────────
    socket.on('chat:message', ({ projectId, message }: { projectId: string; message: string }) => {
      if (!message?.trim() || message.length > 1000) return;

      io.to(projectId).emit('chat:message', {
        id: Date.now().toString(),
        userId: userId || socket.id,
        username: username || 'Guest',
        message: message.trim(),
        timestamp: new Date().toISOString(),
      });
    });

    // ── Disconnect ─────────────────────────────────────────────────────────
    socket.on('disconnecting', async () => {
      try {
        for (const room of socket.rooms) {
          if (room !== socket.id) {
            await leaveRoom(socket, room, io);
          }
        }
      } catch (err) {
        logger.error('Error on disconnecting:', err);
      }
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function leaveRoom(socket: Socket, projectId: string, io: Server) {
  try {
    const roomKey = `room:${projectId}:users`;
    await redisClient.hdel(roomKey, socket.id);

    const allUsers = await getRoomUsers(projectId);
    io.to(projectId).emit('room:users', { users: allUsers });
  } catch (err) {
    // Ignore Redis errors
  }
  socket.to(projectId).emit('room:user-left', { socketId: socket.id });

  await socket.leave(projectId);
}

async function getRoomUsers(projectId: string): Promise<RoomUser[]> {
  try {
    const roomKey = `room:${projectId}:users`;
    const usersData = await redisClient.hvals(roomKey);
    return usersData.map((d) => JSON.parse(d) as RoomUser);
  } catch (err) {
    return [];
  }
}
