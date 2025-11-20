import { Context } from 'hono';
import { mentionService } from '../services/mention.service.js';
import { queryService } from '../services/query.service.js';

export class MentionController {
  async getMentions(c: Context) {
    const userId = c.get('userId') as string;
    const queryId = c.req.param('queryId');
    
    // Verify query ownership
    await queryService.getById(queryId, userId);
    
    // Parse filters
    const provider = c.req.query('provider') as any;
    const from = c.req.query('from') ? new Date(c.req.query('from')!) : undefined;
    const to = c.req.query('to') ? new Date(c.req.query('to')!) : undefined;
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 50;
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!) : 0;
    
    const result = await mentionService.getMentions(queryId, {
      provider,
      from,
      to,
      limit,
      offset,
    });
    
    return c.json(result);
  }

  async getStats(c: Context) {
    const userId = c.get('userId') as string;
    const queryId = c.req.param('queryId');
    
    // Verify query ownership
    await queryService.getById(queryId, userId);
    
    const stats = await mentionService.getMentionStats(queryId);
    
    return c.json(stats);
  }
}

export const mentionController = new MentionController();
