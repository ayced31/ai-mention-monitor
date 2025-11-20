import { Context } from 'hono';
import { brandService } from '../services/brand.service.js';
import type { CreateBrandInput, UpdateBrandInput } from '../validations/brand.schema.js';

export class BrandController {
  async getAll(c: Context) {
    const userId = c.get('userId') as string;

    // Extract query parameters
    const search = c.req.query('search');
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '10', 10);

    const result = await brandService.getAll(userId, { search, page, limit });

    return c.json(result);
  }

  async getById(c: Context) {
    const userId = c.get('userId') as string;
    const brandId = c.req.param('id');
    const brand = await brandService.getById(brandId, userId);
    
    return c.json({ brand });
  }

  async create(c: Context) {
    const userId = c.get('userId') as string;
    const data = c.get('validatedData') as CreateBrandInput;
    const brand = await brandService.create(userId, data);
    
    return c.json({ brand }, 201);
  }

  async update(c: Context) {
    const userId = c.get('userId') as string;
    const brandId = c.req.param('id');
    const data = c.get('validatedData') as UpdateBrandInput;
    const brand = await brandService.update(brandId, userId, data);
    
    return c.json({ brand });
  }

  async delete(c: Context) {
    const userId = c.get('userId') as string;
    const brandId = c.req.param('id');
    const result = await brandService.delete(brandId, userId);
    
    return c.json(result);
  }
}

export const brandController = new BrandController();
