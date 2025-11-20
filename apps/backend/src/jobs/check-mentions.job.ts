import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { prisma } from '../config/database.js';
import { mentionService } from '../services/mention.service.js';
import { logger } from '../utils/logger.js';
import { metricsService } from '../services/metrics.service.js';

export const mentionWorker = new Worker(
  'mentions',
  async (job: Job) => {
    const { name, data } = job;

    logger.info({ jobId: job.id, jobName: name }, 'Processing job');

    switch (name) {
      case 'scheduled-check':
        return await processScheduledCheck();
      
      case 'check-single-provider':
        return await mentionService.processMentionCheck(data);
      
      default:
        throw new Error(`Unknown job: ${name}`);
    }
  },
  {
    connection: redis,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000, // Max 10 jobs per second (rate limiting)
    },
  }
);

async function processScheduledCheck() {
  // Find all active queries that need checking based on frequency
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const queries = await prisma.query.findMany({
    where: {
      isActive: true,
      OR: [
        { lastChecked: null },
        {
          AND: [
            { frequency: 'HOURLY' },
            { lastChecked: { lt: oneHourAgo } },
          ],
        },
        {
          AND: [
            { frequency: 'DAILY' },
            { lastChecked: { lt: oneDayAgo } },
          ],
        },
        {
          AND: [
            { frequency: 'WEEKLY' },
            { lastChecked: { lt: oneWeekAgo } },
          ],
        },
      ],
    },
    take: 100, // Process in batches
  });

  logger.info({ count: queries.length }, 'Processing scheduled mention checks');

  for (const query of queries) {
    await mentionService.checkMention(query.id);
  }

  return { processed: queries.length };
}

// Event handlers
mentionWorker.on('completed', (job) => {
  logger.info({ jobId: job.id, jobName: job.name }, 'Job completed');
  metricsService.recordQueueJob('mentions', 'completed');
});

mentionWorker.on('failed', (job, err) => {
  logger.error({
    jobId: job?.id,
    jobName: job?.name,
    error: err.message,
    stack: err.stack,
  }, 'Job failed');
  metricsService.recordQueueJob('mentions', 'failed');
  metricsService.recordQueueJobFailed('mentions', err.name || 'UnknownError');
});

mentionWorker.on('error', (err) => {
  logger.error({ error: err.message }, 'Worker error');
});

logger.info('Mention worker started');
