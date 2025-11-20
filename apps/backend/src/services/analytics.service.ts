import { prisma } from '../config/database.js';
import { brandService } from './brand.service.js';
import { NotFoundError } from '../utils/errors.js';

interface AnalyticsParams {
  from: string;
  to: string;
  granularity?: 'hour' | 'day' | 'week';
}

interface TimelineDataPoint {
  date: string;
  mentioned: number;
  total: number;
  rate: number;
}

export class AnalyticsService {
  async getBrandAnalytics(brandId: string, userId: string, params: AnalyticsParams) {
    // Verify brand ownership
    await brandService.getById(brandId, userId);

    const from = new Date(params.from);
    const to = new Date(params.to);
    const granularity = params.granularity || 'day';

    // Get all mentions for the brand's queries in the time range
    const mentions = await prisma.mention.findMany({
      where: {
        query: { brandId },
        checkedAt: {
          gte: from,
          lte: to,
        },
      },
      include: {
        query: {
          select: {
            queryText: true,
          },
        },
      },
      orderBy: { checkedAt: 'asc' },
    });

    // Calculate overall stats
    const totalChecks = mentions.length;
    const mentionCount = mentions.filter(m => m.mentioned).length;
    const mentionRate = totalChecks > 0 ? mentionCount / totalChecks : 0;

    // By provider
    const byProvider = this.calculateByProvider(mentions);

    // Timeline data
    const timeline = this.calculateTimeline(mentions, granularity, from, to);

    // Competitor comparison
    const competitorComparison = this.calculateCompetitorComparison(mentions);

    // Top queries
    const topQueries = this.calculateTopQueries(mentions);

    return {
      mentionRate,
      totalChecks,
      mentionCount,
      byProvider,
      timeline,
      competitorComparison,
      topQueries,
      dateRange: { from, to },
    };
  }

  async getSummary(brandId: string, userId: string) {
    // Verify brand ownership
    await brandService.getById(brandId, userId);

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [mentions24h, mentions7d, mentions30d] = await Promise.all([
      this.getMentionsInRange(brandId, last24h, now),
      this.getMentionsInRange(brandId, last7d, now),
      this.getMentionsInRange(brandId, last30d, now),
    ]);

    return {
      last24h: this.calculatePeriodStats(mentions24h),
      last7d: this.calculatePeriodStats(mentions7d),
      last30d: this.calculatePeriodStats(mentions30d),
      topQueries: this.calculateTopQueries(mentions30d).slice(0, 5),
    };
  }

  private async getMentionsInRange(brandId: string, from: Date, to: Date) {
    return prisma.mention.findMany({
      where: {
        query: { brandId },
        checkedAt: {
          gte: from,
          lte: to,
        },
      },
      include: {
        query: {
          select: {
            queryText: true,
          },
        },
      },
    });
  }

  private calculatePeriodStats(mentions: any[]) {
    const total = mentions.length;
    const mentioned = mentions.filter(m => m.mentioned).length;
    const rate = total > 0 ? mentioned / total : 0;

    // Calculate trend (compare first half vs second half)
    const halfPoint = Math.floor(total / 2);
    const firstHalf = mentions.slice(0, halfPoint);
    const secondHalf = mentions.slice(halfPoint);

    const firstRate = firstHalf.length > 0 
      ? firstHalf.filter(m => m.mentioned).length / firstHalf.length 
      : 0;
    const secondRate = secondHalf.length > 0 
      ? secondHalf.filter(m => m.mentioned).length / secondHalf.length 
      : 0;

    const trend = secondRate - firstRate;

    return {
      mentionRate: rate,
      totalChecks: total,
      mentionCount: mentioned,
      trend: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
      trendValue: trend,
    };
  }

  private calculateByProvider(mentions: any[]) {
    const byProvider: Record<string, { total: number; mentioned: number; rate: number }> = {};

    mentions.forEach(mention => {
      if (!byProvider[mention.aiProvider]) {
        byProvider[mention.aiProvider] = { total: 0, mentioned: 0, rate: 0 };
      }
      byProvider[mention.aiProvider].total++;
      if (mention.mentioned) {
        byProvider[mention.aiProvider].mentioned++;
      }
    });

    // Calculate rates
    Object.keys(byProvider).forEach(provider => {
      const stats = byProvider[provider];
      stats.rate = stats.total > 0 ? stats.mentioned / stats.total : 0;
    });

    return Object.entries(byProvider).map(([provider, stats]) => ({
      provider,
      ...stats,
    }));
  }

  private calculateTimeline(
    mentions: any[],
    granularity: 'hour' | 'day' | 'week',
    from: Date,
    to: Date
  ): TimelineDataPoint[] {
    const buckets = new Map<string, { mentioned: number; total: number }>();

    // Initialize buckets
    const current = new Date(from);
    while (current <= to) {
      const key = this.getBucketKey(current, granularity);
      buckets.set(key, { mentioned: 0, total: 0 });
      
      // Increment by granularity
      if (granularity === 'hour') {
        current.setHours(current.getHours() + 1);
      } else if (granularity === 'day') {
        current.setDate(current.getDate() + 1);
      } else {
        current.setDate(current.getDate() + 7);
      }
    }

    // Fill buckets with data
    mentions.forEach(mention => {
      const key = this.getBucketKey(new Date(mention.checkedAt), granularity);
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.total++;
        if (mention.mentioned) {
          bucket.mentioned++;
        }
      }
    });

    // Convert to array
    return Array.from(buckets.entries()).map(([date, stats]) => ({
      date,
      mentioned: stats.mentioned,
      total: stats.total,
      rate: stats.total > 0 ? stats.mentioned / stats.total : 0,
    }));
  }

  private getBucketKey(date: Date, granularity: 'hour' | 'day' | 'week'): string {
    if (granularity === 'hour') {
      return date.toISOString().slice(0, 13) + ':00:00';
    } else if (granularity === 'day') {
      return date.toISOString().slice(0, 10);
    } else {
      // Week: Use Monday of the week
      const monday = new Date(date);
      monday.setDate(date.getDate() - date.getDay() + 1);
      return monday.toISOString().slice(0, 10);
    }
  }

  private calculateCompetitorComparison(mentions: any[]) {
    const competitorStats = new Map<string, { mentions: number; avgPosition: number }>();

    mentions.forEach(mention => {
      if (mention.competitors && typeof mention.competitors === 'object') {
        const competitors = mention.competitors as Record<string, number>;
        Object.entries(competitors).forEach(([competitor, position]) => {
          if (!competitorStats.has(competitor)) {
            competitorStats.set(competitor, { mentions: 0, avgPosition: 0 });
          }
          const stats = competitorStats.get(competitor)!;
          stats.mentions++;
          if (position > 0) {
            stats.avgPosition += position;
          }
        });
      }
    });

    // Calculate averages
    const result = Array.from(competitorStats.entries()).map(([name, stats]) => ({
      name,
      mentionCount: stats.mentions,
      avgPosition: stats.mentions > 0 ? stats.avgPosition / stats.mentions : 0,
      rate: mentions.length > 0 ? stats.mentions / mentions.length : 0,
    }));

    return result.sort((a, b) => b.mentionCount - a.mentionCount);
  }

  private calculateTopQueries(mentions: any[]) {
    const queryStats = new Map<string, { total: number; mentioned: number }>();

    mentions.forEach(mention => {
      const query = mention.query.queryText;
      if (!queryStats.has(query)) {
        queryStats.set(query, { total: 0, mentioned: 0 });
      }
      const stats = queryStats.get(query)!;
      stats.total++;
      if (mention.mentioned) {
        stats.mentioned++;
      }
    });

    return Array.from(queryStats.entries())
      .map(([query, stats]) => ({
        query,
        total: stats.total,
        mentioned: stats.mentioned,
        rate: stats.total > 0 ? stats.mentioned / stats.total : 0,
      }))
      .sort((a, b) => b.rate - a.rate);
  }
}

export const analyticsService = new AnalyticsService();
