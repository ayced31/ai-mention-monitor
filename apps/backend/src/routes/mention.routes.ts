import { Hono } from 'hono';
import { mentionController } from '../controllers/mention.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const mentions = new Hono();

// All mention routes require authentication
mentions.use('*', authMiddleware);

mentions.get('/:queryId/mentions', (c) => mentionController.getMentions(c));
mentions.get('/:queryId/mentions/stats', (c) => mentionController.getStats(c));

export default mentions;
