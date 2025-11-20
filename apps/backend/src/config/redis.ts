import Redis from 'ioredis';
import { env } from './index.js';
import { logger } from '../utils/logger.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

export const redisSub = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis error');
});

redisSub.on('connect', () => {
  logger.info('Redis subscriber connected');
});

redisSub.on('error', (err) => {
  logger.error({ err }, 'Redis subscriber error');
});

// Connect on initialization
await redis.connect();
await redisSub.connect();

// Graceful shutdown
process.on('beforeExit', async () => {
  logger.info('Disconnecting from Redis...');
  await redis.quit();
  await redisSub.quit();
});
