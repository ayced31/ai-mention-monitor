import { z } from 'zod';

export const createQuerySchema = z.object({
  queryText: z.string().min(3, 'Query must be at least 3 characters'),
  frequency: z.enum(['HOURLY', 'DAILY', 'WEEKLY']).default('DAILY'),
  isActive: z.boolean().default(true),
});

export const updateQuerySchema = z.object({
  queryText: z.string().min(3).optional(),
  frequency: z.enum(['HOURLY', 'DAILY', 'WEEKLY']).optional(),
  isActive: z.boolean().optional(),
});

export type CreateQueryInput = z.infer<typeof createQuerySchema>;
export type UpdateQueryInput = z.infer<typeof updateQuerySchema>;
