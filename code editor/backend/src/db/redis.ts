import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    logger.error('Redis reconnect error:', err.message);
    return true;
  },
});

redisClient.on('connect', () => logger.info('Redis: connecting...'));
redisClient.on('ready', () => logger.info('Redis: ready'));
redisClient.on('error', (err) => logger.error('Redis error:', err.message));
redisClient.on('close', () => logger.warn('Redis: connection closed'));

// ── Helper utilities ──────────────────────────────────────────────────────────

/** Set a value with TTL (seconds) */
export async function cacheSet(key: string, value: unknown, ttlSeconds = 300) {
  try {
    await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Ignore if Redis is offline
  }
}

/** Get and parse a cached value */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

/** Delete a cache key */
export async function cacheDel(key: string) {
  try {
    await redisClient.del(key);
  } catch {
    // Ignore if Redis is offline
  }
}

/** Store a blacklisted JWT refresh token */
export async function blacklistToken(token: string, expirySeconds: number) {
  try {
    await redisClient.setex(`blacklist:${token}`, expirySeconds, '1');
  } catch {
    // Ignore if Redis is offline
  }
}

/** Check if a token is blacklisted */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    const result = await redisClient.get(`blacklist:${token}`);
    return result === '1';
  } catch {
    return false;
  }
}
