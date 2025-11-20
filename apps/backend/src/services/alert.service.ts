import { prisma } from '../config/database.js';
import { alertQueue } from '../config/queue.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { CreateAlertInput, UpdateAlertInput } from '../validations/alert.schema.js';

export class AlertService {
  async getAll(userId: string) {
    const alerts = await prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return alerts;
  }

  async getById(alertId: string, userId: string) {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      throw new NotFoundError('Alert not found');
    }

    if (alert.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return alert;
  }

  async create(userId: string, data: CreateAlertInput) {
    const alert = await prisma.alert.create({
      data: {
        ...data,
        userId,
      },
    });

    logger.info({ alertId: alert.id, type: alert.type, channel: alert.channel }, 'Alert created');

    return alert;
  }

  async update(alertId: string, userId: string, data: UpdateAlertInput) {
    // Verify ownership
    await this.getById(alertId, userId);

    const alert = await prisma.alert.update({
      where: { id: alertId },
      data,
    });

    return alert;
  }

  async delete(alertId: string, userId: string) {
    // Verify ownership
    await this.getById(alertId, userId);

    await prisma.alert.delete({
      where: { id: alertId },
    });

    return { success: true };
  }

  async triggerAlert(alertId: string, data: any) {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: { user: true },
    });

    if (!alert || !alert.isActive) {
      logger.warn({ alertId }, 'Alert not found or inactive');
      return;
    }

    // Queue the alert for processing
    await alertQueue.add(
      'send-alert',
      {
        alertId: alert.id,
        userId: alert.userId,
        type: alert.type,
        channel: alert.channel,
        config: alert.config,
        data,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      }
    );

    logger.info({ alertId, type: alert.type, channel: alert.channel }, 'Alert queued');
  }

  async checkMentionAlerts(mention: any, query: any) {
    const userId = query.brand.userId;

    // Get all active alerts for this user
    const alerts = await prisma.alert.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    for (const alert of alerts) {
      let shouldTrigger = false;
      
      switch (alert.type) {
        case 'MENTION_DETECTED':
          shouldTrigger = mention.mentioned;
          break;
          
        case 'MENTION_LOST':
          shouldTrigger = !mention.mentioned;
          break;
          
        case 'COMPETITOR_MENTIONED':
          shouldTrigger = mention.competitors && 
            Object.keys(mention.competitors).length > 0;
          break;
      }

      if (shouldTrigger) {
        await this.triggerAlert(alert.id, {
          mention,
          query,
          brandName: query.brand.name,
        });
      }
    }
  }
}

export const alertService = new AlertService();
