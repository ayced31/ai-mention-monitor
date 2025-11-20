import { prisma } from '../config/database.js';
import { mentionQueue } from '../config/queue.js';
import { AIProviderFactory, type AIProviderType } from './ai/index.js';
import { logger } from '../utils/logger.js';
import { NotFoundError } from '../utils/errors.js';

interface MentionCheckData {
  queryId: string;
  provider: AIProviderType;
  brandName: string;
  brandKeywords: string[];
  queryText: string;
  competitors: string[];
}

export class MentionService {
  async checkMention(queryId: string): Promise<void> {
    const query = await prisma.query.findUnique({
      where: { id: queryId },
      include: { brand: true },
    });

    if (!query) {
      throw new NotFoundError('Query not found');
    }

    const providers: AIProviderType[] = ['OPENAI', 'ANTHROPIC', 'PERPLEXITY'];
    
    logger.info({ queryId, queryText: query.queryText }, 'Queueing mention checks');

    for (const provider of providers) {
      await mentionQueue.add(
        'check-single-provider',
        {
          queryId,
          provider,
          brandName: query.brand.name,
          brandKeywords: query.brand.keywords,
          queryText: query.queryText,
          competitors: query.brand.competitors,
        } as MentionCheckData,
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        }
      );
    }

    logger.info({ queryId, providers: providers.length }, 'Mention checks queued');
  }

  async processMentionCheck(data: MentionCheckData) {
    const aiProvider = AIProviderFactory.create(data.provider);
    
    logger.info({
      queryId: data.queryId,
      provider: data.provider,
      query: data.queryText,
    }, 'Processing mention check');

    try {
      // Query AI provider
      const result = await aiProvider.checkMention({
        query: data.queryText,
        brandName: data.brandName,
        keywords: data.brandKeywords,
        competitors: data.competitors,
      });

      // Save to database
      const mention = await prisma.mention.create({
        data: {
          queryId: data.queryId,
          aiProvider: data.provider,
          mentioned: result.mentioned,
          context: result.context,
          position: result.position,
          competitors: result.competitorPositions,
          confidence: result.confidence,
          rawResponse: result.rawResponse,
        },
      });

      // Update query lastChecked
      await prisma.query.update({
        where: { id: data.queryId },
        data: { lastChecked: new Date() },
      });

      logger.info({
        mentionId: mention.id,
        queryId: data.queryId,
        provider: data.provider,
        mentioned: result.mentioned,
        position: result.position,
      }, 'Mention check completed');

      // Check and trigger alerts
      const query = await prisma.query.findUnique({
        where: { id: data.queryId },
        include: { brand: { include: { user: true } } },
      });

      if (query) {
        // Trigger alerts
        const { alertService } = await import('./alert.service.js');
        await alertService.checkMentionAlerts(mention, query);

        // Emit WebSocket event
        const { emitMentionCreated } = await import('../websocket/index.js');
        emitMentionCreated(mention, query);
      }

      return mention;
    } catch (error: any) {
      logger.error({
        queryId: data.queryId,
        provider: data.provider,
        error: error.message,
      }, 'Mention check failed');
      throw error;
    }
  }

  async getMentions(
    queryId: string,
    filters?: {
      provider?: AIProviderType;
      from?: Date;
      to?: Date;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: any = { queryId };

    if (filters?.provider) {
      where.aiProvider = filters.provider;
    }

    if (filters?.from || filters?.to) {
      where.checkedAt = {};
      if (filters.from) where.checkedAt.gte = filters.from;
      if (filters.to) where.checkedAt.lte = filters.to;
    }

    const [mentions, total] = await Promise.all([
      prisma.mention.findMany({
        where,
        orderBy: { checkedAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.mention.count({ where }),
    ]);

    return {
      mentions,
      total,
      hasMore: (filters?.offset || 0) + mentions.length < total,
    };
  }

  async getMentionStats(queryId: string) {
    const mentions = await prisma.mention.findMany({
      where: { queryId },
      orderBy: { checkedAt: 'desc' },
    });

    const totalChecks = mentions.length;
    const mentionCount = mentions.filter(m => m.mentioned).length;
    const mentionRate = totalChecks > 0 ? mentionCount / totalChecks : 0;

    const byProvider = mentions.reduce((acc, mention) => {
      if (!acc[mention.aiProvider]) {
        acc[mention.aiProvider] = { total: 0, mentioned: 0, rate: 0 };
      }
      acc[mention.aiProvider].total++;
      if (mention.mentioned) {
        acc[mention.aiProvider].mentioned++;
      }
      return acc;
    }, {} as Record<string, { total: number; mentioned: number; rate: number }>);

    // Calculate rates
    Object.keys(byProvider).forEach(provider => {
      const stats = byProvider[provider];
      stats.rate = stats.total > 0 ? stats.mentioned / stats.total : 0;
    });

    return {
      totalChecks,
      mentionCount,
      mentionRate,
      byProvider,
      lastChecked: mentions[0]?.checkedAt || null,
    };
  }
}

export const mentionService = new MentionService();
