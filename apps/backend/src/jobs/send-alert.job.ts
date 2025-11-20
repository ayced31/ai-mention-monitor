import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { emailService } from '../services/email.service.js';
import { slackService } from '../services/slack.service.js';
import { logger } from '../utils/logger.js';
import { metricsService } from '../services/metrics.service.js';

export const alertWorker = new Worker(
  'alerts',
  async (job: Job) => {
    const { alertId, type, channel, config, data } = job.data;

    logger.info({ 
      jobId: job.id, 
      alertId, 
      type, 
      channel 
    }, 'Processing alert');

    try {
      switch (channel) {
        case 'EMAIL':
          await sendEmailAlert(type, config, data);
          break;

        case 'SLACK':
          await sendSlackAlert(type, config, data);
          break;

        case 'WEBHOOK':
          await sendWebhookAlert(config, data);
          break;

        default:
          throw new Error(`Unknown alert channel: ${channel}`);
      }

      logger.info({ alertId, channel }, 'Alert sent successfully');
    } catch (error: any) {
      logger.error({ 
        alertId, 
        channel, 
        error: error.message 
      }, 'Failed to send alert');
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 10,
  }
);

async function sendEmailAlert(type: string, config: any, data: any) {
  let html = '';
  let subject = '';

  switch (type) {
    case 'MENTION_DETECTED':
      subject = `${data.brandName} mentioned by ${data.mention.aiProvider}!`;
      html = emailService.generateMentionDetectedEmail(data);
      break;

    case 'MENTION_LOST':
      subject = `${data.brandName} not mentioned by ${data.mention.aiProvider}`;
      html = emailService.generateMentionLostEmail(data);
      break;

    case 'COMPETITOR_MENTIONED':
      subject = 'Competitor activity detected';
      html = emailService.generateCompetitorMentionedEmail(data);
      break;

    case 'WEEKLY_DIGEST':
      subject = `Your Weekly AI Visibility Report - ${data.summary.totalMentions} Mentions`;
      html = emailService.generateWeeklyDigestEmail(data);
      break;
  }

  await emailService.sendEmail({
    to: config.email,
    subject,
    html,
  });
}

async function sendSlackAlert(type: string, config: any, data: any) {
  let message;

  switch (type) {
    case 'MENTION_DETECTED':
      message = slackService.formatMentionDetected(data);
      break;

    case 'MENTION_LOST':
      message = slackService.formatMentionLost(data);
      break;

    case 'COMPETITOR_MENTIONED':
      message = slackService.formatCompetitorMentioned(data);
      break;

    case 'WEEKLY_DIGEST':
      message = slackService.formatWeeklyDigest(data);
      break;

    default:
      message = {
        webhookUrl: config.webhookUrl,
        text: `Alert: ${type}`,
      };
  }

  message.webhookUrl = config.webhookUrl;
  await slackService.sendMessage(message);
}

async function sendWebhookAlert(config: any, data: any) {
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status}`);
  }
}

// Event handlers
alertWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Alert job completed');
  metricsService.recordQueueJob('alerts', 'completed');
});

alertWorker.on('failed', (job, err) => {
  logger.error({
    jobId: job?.id,
    error: err.message
  }, 'Alert job failed');
  metricsService.recordQueueJob('alerts', 'failed');
  metricsService.recordQueueJobFailed('alerts', err.name || 'UnknownError');
});

logger.info('Alert worker started');
