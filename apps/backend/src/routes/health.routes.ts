import { Hono } from 'hono';
import { prisma } from '../config/database.js';
import { redis } from '../config/redis.js';
import { mentionQueue, alertQueue } from '../config/queue.js';

const health = new Hono();

health.get('/', async (c) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    mentionQueue: await checkQueue(mentionQueue),
    alertQueue: await checkQueue(alertQueue),
  };

  const allHealthy = Object.values(checks).every(status => status === 'up');

  return c.json({
    status: allHealthy ? 'healthy' : 'degraded',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    checks,
  }, allHealthy ? 200 : 503);
});

health.get('/live', (c) => {
  return c.json({ status: 'ok' });
});

health.get('/ready', async (c) => {
  const dbUp = await checkDatabase();
  const redisUp = await checkRedis();
  
  if (dbUp === 'up' && redisUp === 'up') {
    return c.json({ status: 'ready' });
  }
  
  return c.json({ status: 'not ready' }, 503);
});

async function checkDatabase(): Promise<'up' | 'down'> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'up';
  } catch {
    return 'down';
  }
}

async function checkRedis(): Promise<'up' | 'down'> {
  try {
    await redis.ping();
    return 'up';
  } catch {
    return 'down';
  }
}

async function checkQueue(queue: any): Promise<'up' | 'down'> {
  try {
    await queue.getJobCounts();
    return 'up';
  } catch {
    return 'down';
  }
}

export default health;
