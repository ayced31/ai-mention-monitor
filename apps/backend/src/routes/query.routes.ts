import { Hono } from 'hono';
import { queryController } from '../controllers/query.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createQuerySchema, updateQuerySchema } from '../validations/query.schema.js';

const queries = new Hono();

// All query routes require authentication
queries.use('*', authMiddleware);

// Brand-scoped query routes
const brandQueries = new Hono();
brandQueries.get('/:brandId/queries', (c) => queryController.getAll(c));
brandQueries.post('/:brandId/queries', validate(createQuerySchema), (c) => queryController.create(c));

// Individual query routes
queries.get('/:id', (c) => queryController.getById(c));
queries.patch('/:id', validate(updateQuerySchema), (c) => queryController.update(c));
queries.delete('/:id', (c) => queryController.delete(c));
queries.get('/:id/stats', (c) => queryController.getStats(c));
queries.post('/:id/check', (c) => queryController.triggerCheck(c));

export { queries, brandQueries };
