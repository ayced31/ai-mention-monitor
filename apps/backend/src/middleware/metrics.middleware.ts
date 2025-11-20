import { Context, Next } from 'hono';
import { metricsService } from '../services/metrics.service.js';

export const metricsMiddleware = async (c: Context, next: Next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  // Get route pattern (remove IDs for better grouping)
  const route = path
    .replace(/\/[a-f0-9]{24,}/g, '/:id') // MongoDB ObjectId
    .replace(/\/[a-z0-9-]{20,}/g, '/:id') // CUID
    .replace(/\/\d+/g, '/:id'); // Numeric IDs

  try {
    await next();

    const duration = (Date.now() - start) / 1000;
    const status = c.res.status;

    metricsService.recordHttpRequest(method, route, status, duration);
  } catch (error: any) {
    const duration = (Date.now() - start) / 1000;
    const status = c.res.status || 500;

    metricsService.recordHttpRequest(method, route, status, duration);
    metricsService.recordHttpError(method, route, error.name || 'UnknownError');

    throw error;
  }
};
