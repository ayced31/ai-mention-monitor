import { prisma } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { brandService } from './brand.service.js';
import type { CreateQueryInput, UpdateQueryInput } from '../validations/query.schema.js';

export class QueryService {
  async getAll(brandId: string, userId: string) {
    // Verify brand ownership
    await brandService.getById(brandId, userId);

    const queries = await prisma.query.findMany({
      where: { brandId },
      include: {
        _count: {
          select: { mentions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return queries;
  }

  async getById(queryId: string, userId: string) {
    const query = await prisma.query.findUnique({
      where: { id: queryId },
      include: {
        brand: true,
        _count: {
          select: { mentions: true },
        },
      },
    });

    if (!query) {
      throw new NotFoundError('Query not found');
    }

    if (query.brand.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return query;
  }

  async create(brandId: string, userId: string, data: CreateQueryInput) {
    // Verify brand ownership
    await brandService.getById(brandId, userId);

    const query = await prisma.query.create({
      data: {
        ...data,
        brandId,
      },
      include: {
        _count: {
          select: { mentions: true },
        },
      },
    });

    return query;
  }

  async update(queryId: string, userId: string, data: UpdateQueryInput) {
    // Verify ownership
    const existing = await this.getById(queryId, userId);

    const query = await prisma.query.update({
      where: { id: queryId },
      data,
      include: {
        _count: {
          select: { mentions: true },
        },
      },
    });

    return query;
  }

  async delete(queryId: string, userId: string) {
    // Verify ownership
    await this.getById(queryId, userId);

    await prisma.query.delete({
      where: { id: queryId },
    });

    return { success: true };
  }

  async getStats(queryId: string, userId: string) {
    const query = await this.getById(queryId, userId);

    const mentions = await prisma.mention.findMany({
      where: { queryId },
      orderBy: { checkedAt: 'desc' },
      take: 100,
    });

    const totalChecks = mentions.length;
    const mentionCount = mentions.filter(m => m.mentioned).length;
    const mentionRate = totalChecks > 0 ? mentionCount / totalChecks : 0;

    const byProvider = mentions.reduce((acc, mention) => {
      if (!acc[mention.aiProvider]) {
        acc[mention.aiProvider] = { total: 0, mentioned: 0 };
      }
      acc[mention.aiProvider].total++;
      if (mention.mentioned) {
        acc[mention.aiProvider].mentioned++;
      }
      return acc;
    }, {} as Record<string, { total: number; mentioned: number }>);

    return {
      query,
      totalChecks,
      mentionCount,
      mentionRate,
      byProvider,
      lastChecked: query.lastChecked,
      recentMentions: mentions.slice(0, 10),
    };
  }
}

export const queryService = new QueryService();
