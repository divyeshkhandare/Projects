// ─────────────────────────────────────────────────────────────────────────────
// Auth Service — JWT generation, Google OAuth, password handling
// ─────────────────────────────────────────────────────────────────────────────

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../db/client';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { blacklistToken } from '../db/redis';
import nodemailer from 'nodemailer';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// ── Token helpers ─────────────────────────────────────────────────────────────

export function generateAccessToken(payload: { id: string; email: string; role: string; username: string }) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function generateRefreshToken(payload: { id: string }) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
}

export function generateTokenPair(user: { id: string; email: string; role: string; username: string }) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken({ id: user.id });
  return { accessToken, refreshToken };
}

// ── Register ──────────────────────────────────────────────────────────────────

export async function register(data: {
  email: string;
  username: string;
  name: string;
  password: string;
}) {
  const exists = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { username: data.username }] },
  });

  if (exists) {
    const field = exists.email === data.email ? 'email' : 'username';
    throw new AppError(`This ${field} is already taken`, 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      name: data.name,
      passwordHash,
      oauthProvider: 'LOCAL',
    },
    select: { id: true, email: true, role: true, username: true, name: true, avatar: true },
  });

  const tokens = generateTokenPair({ id: user.id, email: user.email, role: user.role, username: user.username });

  // Persist refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return { user, tokens };
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account has been deactivated', 403);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const tokens = generateTokenPair({ id: user.id, email: user.email, role: user.role, username: user.username });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken, lastLoginAt: new Date() },
  });

  return {
    user: { id: user.id, email: user.email, role: user.role, username: user.username, name: user.name, avatar: user.avatar },
    tokens,
  };
}

// ── Google OAuth ──────────────────────────────────────────────────────────────

export async function googleLogin(idToken: string) {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new AppError('Google OAuth is not configured', 501);
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new AppError('Invalid Google token', 401);
  }

  // Find or create user
  let user = await prisma.user.findFirst({
    where: { OR: [{ email: payload.email }, { oauthId: payload.sub }] },
  });

  if (!user) {
    // Generate unique username from email
    const baseUsername = payload.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
    let username = baseUsername;
    let attempt = 0;
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${++attempt}`;
    }

    user = await prisma.user.create({
      data: {
        email: payload.email,
        username,
        name: payload.name || payload.email.split('@')[0],
        avatar: payload.picture,
        oauthProvider: 'GOOGLE',
        oauthId: payload.sub,
        emailVerified: true,
      },
    });
  }

  if (!user.isActive) {
    throw new AppError('Account has been deactivated', 403);
  }

  const tokens = generateTokenPair({ id: user.id, email: user.email, role: user.role, username: user.username });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken, lastLoginAt: new Date() },
  });

  return {
    user: { id: user.id, email: user.email, role: user.role, username: user.username, name: user.name, avatar: user.avatar },
    tokens,
  };
}

// ── Refresh Token ─────────────────────────────────────────────────────────────

export async function refreshAccessToken(refreshToken: string) {
  let payload: { id: string };
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string };
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user || user.refreshToken !== refreshToken || !user.isActive) {
    throw new AppError('Refresh token mismatch or expired', 401);
  }

  const tokens = generateTokenPair({ id: user.id, email: user.email, role: user.role, username: user.username });
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });

  return tokens;
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logout(userId: string, accessToken: string) {
  // Blacklist the current access token (15 min TTL)
  await blacklistToken(accessToken, 60 * 15);
  // Clear refresh token in DB
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
}

// ── Forgot Password ───────────────────────────────────────────────────────────

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // Silent fail — don't reveal if email exists

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });

  if (env.SMTP_HOST && env.SMTP_USER) {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'CodeForge — Reset your password',
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  }
}

// ── Reset Password ────────────────────────────────────────────────────────────

export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null, refreshToken: null },
  });
}
