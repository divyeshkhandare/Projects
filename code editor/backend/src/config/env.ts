// ─────────────────────────────────────────────────────────────────────────────
// Environment Configuration — validated at startup with Zod
// ─────────────────────────────────────────────────────────────────────────────

import 'dotenv/config';
import { z } from 'zod';
import path from 'path';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  // Storage
  STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
  UPLOADS_DIR: z.string().default('./uploads'),

  // S3 (optional)
  AWS_BUCKET_NAME: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  // Docker Sandbox
  SANDBOX_TIMEOUT: z.coerce.number().default(15),
  SANDBOX_MEMORY: z.string().default('256m'),
  SANDBOX_CPUS: z.string().default('0.5'),
  SANDBOX_NETWORK: z.string().default('none'),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@codeforge.dev'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  EXECUTE_RATE_LIMIT_MAX: z.coerce.number().default(20),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  UPLOADS_DIR: path.resolve(parsed.data.UPLOADS_DIR),
  IS_PROD: parsed.data.NODE_ENV === 'production',
  IS_DEV: parsed.data.NODE_ENV === 'development',
};
