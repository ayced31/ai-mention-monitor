import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';

// Import workers (they auto-start when imported)
import './check-mentions.job.js';
import './send-alert.job.js';
import './weekly-digest.job.js';

// Create queues
export const mentionQueue = new Queue('mentions', { connection: redis });
export const alertQueue = new Queue('alerts', { connection: redis });
import { weeklyDigestQueue } from './weekly-digest.job.js';

// Schedule recurring jobs
export async function scheduleRecurringJobs() {
  logger.info('Scheduling recurring jobs...');

  try {
    // Schedule mention checks every 5 minutes
    await mentionQueue.add(
      'scheduled-check',
      {},
      {
        repeat: {
          pattern: '*/5 * * * *', // Every 5 minutes
        },
        jobId: 'scheduled-mention-check',
      }
    );

    logger.info('Scheduled: Mention checks every 5 minutes');

    // Schedule weekly digest every Monday at 9 AM
    await weeklyDigestQueue.add(
      'weekly-digest',
      {},
      {
        repeat: {
          pattern: '0 9 * * 1', // Every Monday at 9 AM
        },
        jobId: 'weekly-digest',
      }
    );

    logger.info('Scheduled: Weekly digest every Monday at 9 AM');

    logger.info('All recurring jobs scheduled successfully');
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to schedule recurring jobs');
    throw error;
  }
}

// Initialize job scheduler
scheduleRecurringJobs().catch((error) => {
  logger.error({ error: error.message }, 'Job scheduler initialization failed');
  process.exit(1);
});

export { weeklyDigestQueue };
