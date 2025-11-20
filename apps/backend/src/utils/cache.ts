import { redis } from '../config/redis.js';
import { logger } from './logger.js';
import { metricsService } from '../services/metrics.service.js';

export const CacheKeys = {
  // User-specific
  userProfile: (userId: string) => `user:${userId}:profile`,
  userBrands: (userId: string) => `user:${userId}:brands`,
  userAlerts: (userId: string) => `user:${userId}:alerts`,

  // Brand-specific
  brandAnalytics: (brandId: string, from: string, to: string, granularity: string) =>
    `brand:${brandId}:analytics:${from}:${to}:${granularity}`,
  brandSummary: (brandId: string) => `brand:${brandId}:summary`,
  brandQueries: (brandId: string) => `brand:${brandId}:queries`,

  // Query-specific
  queryMentions: (queryId: string, filters: string) =>
    `query:${queryId}:mentions:${filters}`,
  queryStats: (queryId: string) => `query:${queryId}:stats`,

  // Mention checks (short TTL to avoid duplicate API calls)
  mentionCheck: (queryId: string, provider: string, timestamp: string) =>
    `mention:${queryId}:${provider}:${timestamp}`,
};

export const CacheTTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 3600,          // 1 hour
  ANALYTICS: 300,      // 5 minutes
  SUMMARY: 60,         // 1 minute (frequently updated)
  USER_DATA: 600,      // 10 minutes
  MENTION_CHECK: 300,  // 5 minutes (prevent duplicate checks)
};

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error: any) {
      logger.error({ key, error: error.message }, 'Cache get error');
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = CacheTTL.MEDIUM): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error: any) {
      logger.error({ key, error: error.message }, 'Cache set error');
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error: any) {
      logger.error({ key, error: error.message }, 'Cache delete error');
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.debug({ pattern, count: keys.length }, 'Cache invalidated');
      }
    } catch (error: any) {
      logger.error({ pattern, error: error.message }, 'Cache invalidate error');
    }
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CacheTTL.MEDIUM
  ): Promise<T> {
    const keyPrefix = key.split(':')[0];
    const cached = await this.get<T>(key);

    if (cached !== null) {
      logger.debug({ key }, 'Cache hit');
      metricsService.recordCacheHit(keyPrefix);
      return cached;
    }

    logger.debug({ key }, 'Cache miss');
    metricsService.recordCacheMiss(keyPrefix);
    const fresh = await fetcher();
    await this.set(key, fresh, ttl);
    return fresh;
  }

  async remember<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    return this.getOrSet(key, fetcher, ttl);
  }
}

export const cache = new CacheService();
