import { Context, Next } from 'hono';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

export async function errorHandler(err: Error, c: Context) {
  logger.error({ 
    err: err.message, 
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  }, 'Request error');

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return c.json({
      error: 'Validation error',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    }, 400);
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return c.json({
      error: err.message,
    }, err.statusCode);
  }

  // Handle Prisma errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      return c.json({ error: 'Resource already exists' }, 409);
    }
    if (prismaErr.code === 'P2025') {
      return c.json({ error: 'Resource not found' }, 404);
    }
  }

  // Default 500 error
  return c.json({
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal server error',
  }, 500);
}
