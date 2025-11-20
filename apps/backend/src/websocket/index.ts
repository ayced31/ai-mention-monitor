import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redis, redisSub } from '../config/redis.js';
import { verifyToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/index.js';

let io: Server | null = null;

export function setupWebSocket(httpServer: any) {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Redis adapter for horizontal scaling
  io.adapter(createAdapter(redis, redisSub));

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        throw new Error('No token provided');
      }
      
      const decoded = await verifyToken(token);
      socket.data.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    
    logger.info({ userId, socketId: socket.id }, 'Client connected');
    
    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle subscribing to brand updates
    socket.on('subscribe:brand', (brandId: string) => {
      socket.join(`brand:${brandId}`);
      logger.debug({ userId, brandId }, 'Subscribed to brand');
    });

    socket.on('unsubscribe:brand', (brandId: string) => {
      socket.leave(`brand:${brandId}`);
      logger.debug({ userId, brandId }, 'Unsubscribed from brand');
    });

    // Handle subscribing to query updates
    socket.on('subscribe:query', (queryId: string) => {
      socket.join(`query:${queryId}`);
      logger.debug({ userId, queryId }, 'Subscribed to query');
    });

    socket.on('unsubscribe:query', (queryId: string) => {
      socket.leave(`query:${queryId}`);
      logger.debug({ userId, queryId }, 'Unsubscribed from query');
    });

    socket.on('disconnect', () => {
      logger.info({ userId, socketId: socket.id }, 'Client disconnected');
    });
  });

  logger.info('WebSocket server initialized');
  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('WebSocket not initialized. Call setupWebSocket first.');
  }
  return io;
}

// Event emitters for services to use
export const emitMentionCreated = (mention: any, query: any) => {
  if (!io) return;
  
  const userId = query.brand?.userId;
  if (userId) {
    io.to(`user:${userId}`).emit('mention:new', {
      mention,
      query: {
        id: query.id,
        queryText: query.queryText,
      },
      brand: {
        id: query.brand.id,
        name: query.brand.name,
      },
    });
  }

  io.to(`query:${query.id}`).emit('mention:new', {
    mention,
  });
};

export const emitAlertTriggered = (userId: string, alert: any) => {
  if (!io) return;
  
  io.to(`user:${userId}`).emit('alert:triggered', alert);
};

export const emitQueryChecked = (queryId: string, stats: any) => {
  if (!io) return;
  
  io.to(`query:${queryId}`).emit('query:checked', stats);
};
