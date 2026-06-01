import { Router } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import rateLimit from 'express-rate-limit';

const router = Router();

// AI rate limiter: 30 requests per 15 minutes
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'AI rate limit reached. Please wait before making more requests.' },
});

let openai: OpenAI | null = null;
if (env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

function requireOpenAI() {
  if (!openai) throw new AppError('AI features require an OpenAI API key to be configured.', 503);
}

const aiRequestSchema = z.object({
  code: z.string().max(50_000),
  language: z.string().default('javascript'),
  context: z.string().max(2000).optional(),
});

// ── POST /api/v1/ai/explain — explain selected code ───────────────────────────
router.post('/explain', authenticate, aiLimiter, asyncHandler(async (req: AuthRequest, res) => {
  requireOpenAI();
  const { code, language } = aiRequestSchema.parse(req.body);

  const completion = await openai!.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: 'You are a senior software engineer helping developers understand code. Explain clearly and concisely.' },
      { role: 'user', content: `Explain this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`` },
    ],
    max_tokens: 1000,
    temperature: 0.3,
  });

  res.json({ success: true, data: { explanation: completion.choices[0].message.content } });
}));

// ── POST /api/v1/ai/debug — find bugs in code ─────────────────────────────────
router.post('/debug', authenticate, aiLimiter, asyncHandler(async (req: AuthRequest, res) => {
  requireOpenAI();
  const { code, language, context } = aiRequestSchema.parse(req.body);

  const errorContext = context ? `\n\nError/Context: ${context}` : '';
  const completion = await openai!.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: 'You are an expert debugger. Find bugs, explain them, and provide fixed code.' },
      { role: 'user', content: `Debug this ${language} code:${errorContext}\n\`\`\`${language}\n${code}\n\`\`\`` },
    ],
    max_tokens: 2000,
    temperature: 0.2,
  });

  res.json({ success: true, data: { analysis: completion.choices[0].message.content } });
}));

// ── POST /api/v1/ai/refactor — refactor code ──────────────────────────────────
router.post('/refactor', authenticate, aiLimiter, asyncHandler(async (req: AuthRequest, res) => {
  requireOpenAI();
  const { code, language } = aiRequestSchema.parse(req.body);

  const completion = await openai!.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: 'You are an expert at code refactoring. Improve code quality, readability, and maintainability. Always return the refactored code with explanations.' },
      { role: 'user', content: `Refactor this ${language} code for better quality:\n\`\`\`${language}\n${code}\n\`\`\`` },
    ],
    max_tokens: 2000,
    temperature: 0.3,
  });

  res.json({ success: true, data: { refactored: completion.choices[0].message.content } });
}));

// ── POST /api/v1/ai/optimize — optimize for performance ───────────────────────
router.post('/optimize', authenticate, aiLimiter, asyncHandler(async (req: AuthRequest, res) => {
  requireOpenAI();
  const { code, language } = aiRequestSchema.parse(req.body);

  const completion = await openai!.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: 'You are a performance optimization expert. Analyze code for performance issues and provide optimized solutions with benchmarking insights.' },
      { role: 'user', content: `Optimize this ${language} code for performance:\n\`\`\`${language}\n${code}\n\`\`\`` },
    ],
    max_tokens: 2000,
    temperature: 0.2,
  });

  res.json({ success: true, data: { optimized: completion.choices[0].message.content } });
}));

// ── POST /api/v1/ai/generate — generate code from description ─────────────────
router.post('/generate', authenticate, aiLimiter, asyncHandler(async (req: AuthRequest, res) => {
  requireOpenAI();
  const { description, language } = z.object({
    description: z.string().min(1).max(1000),
    language: z.string(),
  }).parse(req.body);

  const completion = await openai!.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: `You are an expert ${language} developer. Generate clean, well-commented, production-ready code. Only return the code, no explanations unless asked.` },
      { role: 'user', content: `Write ${language} code for: ${description}` },
    ],
    max_tokens: 2000,
    temperature: 0.4,
  });

  res.json({ success: true, data: { code: completion.choices[0].message.content } });
}));

// ── POST /api/v1/ai/complete — inline code completion ─────────────────────────
router.post('/complete', authenticate, aiLimiter, asyncHandler(async (req: AuthRequest, res) => {
  requireOpenAI();
  const { prefix, suffix, language } = z.object({
    prefix: z.string().max(10_000),
    suffix: z.string().max(5_000).default(''),
    language: z.string(),
  }).parse(req.body);

  const completion = await openai!.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: `Complete the ${language} code. Only return the completion text to insert between the prefix and suffix. No explanations.` },
      { role: 'user', content: `Prefix:\n${prefix}\n\nSuffix:\n${suffix}` },
    ],
    max_tokens: 500,
    temperature: 0.1,
  });

  res.json({ success: true, data: { completion: completion.choices[0].message.content } });
}));

// ── POST /api/v1/ai/chat — conversational AI assistant ────────────────────────
router.post('/chat', authenticate, aiLimiter, asyncHandler(async (req: AuthRequest, res) => {
  requireOpenAI();
  const { messages, code, language } = z.object({
    messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).max(20),
    code: z.string().optional(),
    language: z.string().optional(),
  }).parse(req.body);

  const systemPrompt = `You are CodeForge AI, an expert programming assistant. You help with debugging, code review, architecture, and general programming questions.${code ? `\n\nCurrent code context (${language}):\n\`\`\`${language}\n${code}\n\`\`\`` : ''}`;

  const completion = await openai!.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    max_tokens: 1500,
    temperature: 0.5,
    stream: false,
  });

  res.json({ success: true, data: { message: completion.choices[0].message.content } });
}));

export default router;
