import { Hono } from 'hono';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const analytics = new Hono();

// All analytics routes require authentication
analytics.use('*', authMiddleware);

analytics.get('/:brandId/analytics', (c) => analyticsController.getBrandAnalytics(c));
analytics.get('/:brandId/analytics/summary', (c) => analyticsController.getSummary(c));

export default analytics;
