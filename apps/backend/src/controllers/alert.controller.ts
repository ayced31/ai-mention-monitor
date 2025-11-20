import { Context } from 'hono';
import { alertService } from '../services/alert.service.js';
import type { CreateAlertInput, UpdateAlertInput } from '../validations/alert.schema.js';

export class AlertController {
  async getAll(c: Context) {
    const userId = c.get('userId') as string;
    const alerts = await alertService.getAll(userId);
    
    return c.json({ alerts });
  }

  async getById(c: Context) {
    const userId = c.get('userId') as string;
    const alertId = c.req.param('id');
    const alert = await alertService.getById(alertId, userId);
    
    return c.json({ alert });
  }

  async create(c: Context) {
    const userId = c.get('userId') as string;
    const data = c.get('validatedData') as CreateAlertInput;
    const alert = await alertService.create(userId, data);
    
    return c.json({ alert }, 201);
  }

  async update(c: Context) {
    const userId = c.get('userId') as string;
    const alertId = c.req.param('id');
    const data = c.get('validatedData') as UpdateAlertInput;
    const alert = await alertService.update(alertId, userId, data);
    
    return c.json({ alert });
  }

  async delete(c: Context) {
    const userId = c.get('userId') as string;
    const alertId = c.req.param('id');
    const result = await alertService.delete(alertId, userId);
    
    return c.json(result);
  }
}

export const alertController = new AlertController();
