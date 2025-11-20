import { Context, Next } from 'hono';
import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors.js';

export function validate(schema: ZodSchema, source: 'json' | 'query' | 'param' = 'json') {
  return async (c: Context, next: Next) => {
    let data: any;
    
    switch (source) {
      case 'json':
        data = await c.req.json();
        break;
      case 'query':
        data = c.req.query();
        break;
      case 'param':
        data = c.req.param();
        break;
    }
    
    const result = schema.safeParse(data);
    
    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      throw new ValidationError(
        `Validation failed: ${errors.map(e => `${e.path}: ${e.message}`).join(', ')}`
      );
    }
    
    c.set('validatedData', result.data);
    await next();
  };
}
