import { Hono } from 'hono';
import { brandController } from '../controllers/brand.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createBrandSchema, updateBrandSchema } from '../validations/brand.schema.js';

const brands = new Hono();

// All brand routes require authentication
brands.use('*', authMiddleware);

brands.get('/', (c) => brandController.getAll(c));
brands.post('/', validate(createBrandSchema), (c) => brandController.create(c));
brands.get('/:id', (c) => brandController.getById(c));
brands.patch('/:id', validate(updateBrandSchema), (c) => brandController.update(c));
brands.delete('/:id', (c) => brandController.delete(c));

export default brands;
