import { Context } from 'hono';
import { analyticsService } from '../services/analytics.service.js';

export class AnalyticsController {
  async getBrandAnalytics(c: Context) {
    const userId = c.get('userId') as string;
    const brandId = c.req.param('brandId');
    
    const from = c.req.query('from');
    const to = c.req.query('to');
    const granularity = c.req.query('granularity') as 'hour' | 'day' | 'week' | undefined;

    if (!from || !to) {
      return c.json({ error: 'from and to query parameters are required' }, 400);
    }

    const analytics = await analyticsService.getBrandAnalytics(brandId, userId, {
      from,
      to,
      granularity,
    });

    return c.json(analytics);
  }

  async getSummary(c: Context) {
    const userId = c.get('userId') as string;
    const brandId = c.req.param('brandId');

    const summary = await analyticsService.getSummary(brandId, userId);

    return c.json(summary);
  }
}

export const analyticsController = new AnalyticsController();
