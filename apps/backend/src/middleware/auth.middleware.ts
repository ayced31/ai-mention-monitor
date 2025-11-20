import { Context, Next } from 'hono';
import { verifyToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.slice(7);
  
  try {
    const decoded = await verifyToken(token);
    
    if (decoded.type === 'refresh') {
      throw new UnauthorizedError('Invalid token type');
    }
    
    c.set('userId', decoded.userId);
    await next();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
