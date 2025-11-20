import { Worker, Job, Queue } from 'bullmq';
import { redis } from '../config/redis.js';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

export const weeklyDigestQueue = new Queue('weekly-digest', {
  connection: redis,
});

const alertQueue = new Queue('alerts', {
  connection: redis,
});

export const weeklyDigestWorker = new Worker(
  'weekly-digest',
  async (job: Job) => {
    logger.info({ jobId: job.id }, 'Processing weekly digest job');

    try {
      await processWeeklyDigest();
      return { success: true };
    } catch (error: any) {
      logger.error({ error: error.message }, 'Weekly digest job failed');
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 1,
  }
);

async function processWeeklyDigest() {
  // Calculate date range (last 7 days)
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);

  logger.info({ from, to }, 'Generating weekly digests');

  // Get all users with active alerts configured for weekly digest
  const users = await prisma.user.findMany({
    where: {
      alerts: {
        some: {
          isActive: true,
          type: 'WEEKLY_DIGEST',
        },
      },
    },
    include: {
      alerts: {
        where: {
          isActive: true,
          type: 'WEEKLY_DIGEST',
        },
      },
      brands: {
        include: {
          queries: {
            include: {
              mentions: {
                where: {
                  createdAt: {
                    gte: from,
                    lte: to,
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  logger.info({ userCount: users.length }, 'Found users for weekly digest');

  for (const user of users) {
    try {
      const digestData = await generateDigestData(user, from, to);

      // Queue alerts for this user
      for (const alert of user.alerts) {
        await alertQueue.add('send-alert', {
          alertId: alert.id,
          type: 'WEEKLY_DIGEST',
          channel: alert.channel,
          config: alert.config,
          data: digestData,
        });
      }

      logger.info({ userId: user.id, alertCount: user.alerts.length }, 'Queued weekly digest alerts');
    } catch (error: any) {
      logger.error({ userId: user.id, error: error.message }, 'Failed to generate digest for user');
    }
  }
}

async function generateDigestData(user: any, from: Date, to: Date) {
  // Get all mentions for the user's brands in the date range
  const allMentions = user.brands.flatMap((brand: any) =>
    brand.queries.flatMap((query: any) => query.mentions)
  );

  // Get all mention checks (total checks performed)
  const totalChecks = await prisma.mention.count({
    where: {
      query: {
        brand: {
          userId: user.id,
        },
      },
      createdAt: {
        gte: from,
        lte: to,
      },
    },
  });

  // Calculate summary statistics
  const totalMentions = allMentions.filter((m: any) => m.isMentioned).length;

  // Get previous week's data for comparison
  const previousFrom = new Date(from.getTime() - 7 * 24 * 60 * 60 * 1000);
  const previousTo = from;

  const previousMentions = await prisma.mention.count({
    where: {
      query: {
        brand: {
          userId: user.id,
        },
      },
      isMentioned: true,
      createdAt: {
        gte: previousFrom,
        lt: previousTo,
      },
    },
  });

  const mentionChange = previousMentions > 0
    ? Math.round(((totalMentions - previousMentions) / previousMentions) * 100)
    : totalMentions > 0 ? 100 : 0;

  // Find top provider
  const providerCounts: Record<string, number> = {};
  allMentions
    .filter((m: any) => m.isMentioned)
    .forEach((m: any) => {
      providerCounts[m.aiProvider] = (providerCounts[m.aiProvider] || 0) + 1;
    });

  const topProvider = Object.entries(providerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Calculate brand performance
  const brands = user.brands.map((brand: any) => {
    const brandMentions = brand.queries.flatMap((q: any) => q.mentions);
    const brandMentionCount = brandMentions.filter((m: any) => m.isMentioned).length;
    const brandTotalChecks = brandMentions.length;
    const mentionRate = brandTotalChecks > 0 ? (brandMentionCount / brandTotalChecks) * 100 : 0;

    // Calculate trend (compare with previous week)
    // Simplified: just check if mentions increased, decreased, or stayed same
    const trend = mentionChange > 5 ? 'up' : mentionChange < -5 ? 'down' : 'stable';

    return {
      id: brand.id,
      name: brand.name,
      mentionCount: brandMentionCount,
      mentionRate,
      trend,
    };
  }).sort((a: any, b: any) => b.mentionCount - a.mentionCount);

  // Get top queries
  const queryStats = user.brands.flatMap((brand: any) =>
    brand.queries.map((query: any) => {
      const mentions = query.mentions.filter((m: any) => m.isMentioned).length;
      const total = query.mentions.length;
      return {
        id: query.id,
        queryText: query.queryText,
        mentions,
        mentionRate: total > 0 ? (mentions / total) * 100 : 0,
      };
    })
  ).sort((a: any, b: any) => b.mentions - a.mentions).slice(0, 5);

  // Get competitor activity
  const competitorMentions = allMentions.filter((m: any) =>
    m.competitors && Object.keys(m.competitors).length > 0
  );

  const competitorNames = new Set<string>();
  competitorMentions.forEach((m: any) => {
    if (m.competitors) {
      Object.keys(m.competitors).forEach(name => competitorNames.add(name));
    }
  });

  const topCompetitors = Array.from(competitorNames).slice(0, 5);

  return {
    user: {
      name: user.name,
    },
    dateRange: {
      from: from.toISOString(),
      to: to.toISOString(),
    },
    summary: {
      totalMentions,
      mentionChange,
      topProvider,
      totalChecks,
    },
    brands,
    topQueries: queryStats,
    competitorActivity: {
      totalCompetitorMentions: competitorMentions.length,
      topCompetitors,
    },
  };
}

// Event handlers
weeklyDigestWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Weekly digest job completed');
});

weeklyDigestWorker.on('failed', (job, err) => {
  logger.error({
    jobId: job?.id,
    error: err.message,
    stack: err.stack,
  }, 'Weekly digest job failed');
});

logger.info('Weekly digest worker started');
