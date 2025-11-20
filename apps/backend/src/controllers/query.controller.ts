import { Context } from 'hono';
import { queryService } from '../services/query.service.js';
import type { CreateQueryInput, UpdateQueryInput } from '../validations/query.schema.js';

export class QueryController {
  async getAll(c: Context) {
    const userId = c.get('userId') as string;
    const brandId = c.req.param('brandId');
    const queries = await queryService.getAll(brandId, userId);
    
    return c.json({ queries });
  }

  async getById(c: Context) {
    const userId = c.get('userId') as string;
    const queryId = c.req.param('id');
    const query = await queryService.getById(queryId, userId);
    
    return c.json({ query });
  }

  async create(c: Context) {
    const userId = c.get('userId') as string;
    const brandId = c.req.param('brandId');
    const data = c.get('validatedData') as CreateQueryInput;
    const query = await queryService.create(brandId, userId, data);
    
    return c.json({ query }, 201);
  }

  async update(c: Context) {
    const userId = c.get('userId') as string;
    const queryId = c.req.param('id');
    const data = c.get('validatedData') as UpdateQueryInput;
    const query = await queryService.update(queryId, userId, data);
    
    return c.json({ query });
  }

  async delete(c: Context) {
    const userId = c.get('userId') as string;
    const queryId = c.req.param('id');
    const result = await queryService.delete(queryId, userId);
    
    return c.json(result);
  }

  async getStats(c: Context) {
    const userId = c.get('userId') as string;
    const queryId = c.req.param('id');
    const stats = await queryService.getStats(queryId, userId);
    
    return c.json(stats);
  }

  async triggerCheck(c: Context) {
    const userId = c.get('userId') as string;
    const queryId = c.req.param('id');
    
    // Import here to avoid circular dependency
    const { mentionService } = await import('../services/mention.service.js');
    
    // Verify ownership first
    await queryService.getById(queryId, userId);
    
    // Queue the mention check
    await mentionService.checkMention(queryId);
    
    return c.json({ 
      message: 'Mention check queued',
      queryId 
    }, 202);
  }
}

export const queryController = new QueryController();
