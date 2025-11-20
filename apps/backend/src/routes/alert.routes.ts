import { Hono } from 'hono';
import { alertController } from '../controllers/alert.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createAlertSchema, updateAlertSchema } from '../validations/alert.schema.js';

const alerts = new Hono();

// All alert routes require authentication
alerts.use('*', authMiddleware);

alerts.get('/', (c) => alertController.getAll(c));
alerts.post('/', validate(createAlertSchema), (c) => alertController.create(c));
alerts.get('/:id', (c) => alertController.getById(c));
alerts.patch('/:id', validate(updateAlertSchema), (c) => alertController.update(c));
alerts.delete('/:id', (c) => alertController.delete(c));

export default alerts;
