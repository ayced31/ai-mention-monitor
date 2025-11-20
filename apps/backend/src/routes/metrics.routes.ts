import { Hono } from 'hono';
import { metricsService } from '../services/metrics.service.js';

const metrics = new Hono();

// GET /metrics - Prometheus metrics endpoint
metrics.get('/', async (c) => {
  const metricsData = await metricsService.getMetrics();

  return c.text(metricsData, 200, {
    'Content-Type': 'text/plain; version=0.0.4',
  });
});

export default metrics;
