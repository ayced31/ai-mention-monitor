import { serve } from '@hono/node-server';
import { createServer } from 'http';
import app from './app.js';
import { env } from './config/index.js';
import { logger } from './utils/logger.js';
import { setupWebSocket } from './websocket/index.js';
import './config/redis.js'; // Initialize Redis connection
import './config/database.js'; // Initialize Prisma
import './jobs/index.js'; // Initialize job scheduler

const port = env.PORT;

logger.info({ port, env: env.NODE_ENV }, 'Starting server...');

// Create HTTP server
const server = createServer(app.fetch as any);

// Setup WebSocket
setupWebSocket(server);

// Start server
server.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
  logger.info(`WebSocket server ready`);
});
