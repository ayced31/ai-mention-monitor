import './config/index.js';
import { logger } from './utils/logger.js';
import './config/database.js';
import './config/redis.js';
import './jobs/check-mentions.job.js';
import './jobs/send-alert.job.js';

logger.info('Worker process started - handling mentions and alerts');

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down worker...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down worker...');
  process.exit(0);
});
