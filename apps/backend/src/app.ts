import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { errorHandler } from './middleware/error.middleware.js';
import { metricsMiddleware } from './middleware/metrics.middleware.js';
import { logger } from './utils/logger.js';
import { env } from './config/index.js';

const app = new Hono();

// Handle OPTIONS (preflight) requests manually to fix CORS compatibility issue
app.use('*', async (c, next) => {
  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': env.FRONTEND_URL,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Correlation-Id',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  await next();
});

// Global middleware
app.use('*', cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

app.use('*', secureHeaders());
app.use('*', honoLogger());
app.use('*', metricsMiddleware);

// Request logging with correlation ID
app.use('*', async (c, next) => {
  const correlationId = c.req.header('x-correlation-id') || crypto.randomUUID();
  c.set('correlationId', correlationId);
  c.header('x-correlation-id', correlationId);
  
  const start = Date.now();
  await next();
  
  logger.info({
    correlationId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration: Date.now() - start,
  });
});

// Import routes
import routes from './routes/index.js';
import health from './routes/health.routes.js';
import metrics from './routes/metrics.routes.js';

// Health check (no auth required)
app.route('/health', health);

// Metrics endpoint (no auth required for Prometheus scraping)
app.route('/metrics', metrics);

// API routes
app.route('/v1', routes);

// Error handling
app.onError(errorHandler);

export default app;
