import { Context, Next } from 'hono';
import { redis } from '../config/redis.js';
import { TooManyRequestsError } from '../utils/errors.js';

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export function rateLimit(options: RateLimitOptions) {
  return async (c: Context, next: Next) => {
    const userId = c.get('userId') || c.req.header('x-forwarded-for') || 'anonymous';
    const key = `ratelimit:${userId}:${c.req.path}`;
    
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.pexpire(key, options.windowMs);
    }
    
    c.header('X-RateLimit-Limit', String(options.max));
    c.header('X-RateLimit-Remaining', String(Math.max(0, options.max - current)));
    
    if (current > options.max) {
      throw new TooManyRequestsError();
    }
    
    await next();
  };
}
