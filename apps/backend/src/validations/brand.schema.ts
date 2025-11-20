import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  domain: z.string().url('Invalid domain URL').optional(),
  keywords: z.array(z.string()).default([]),
  competitors: z.array(z.string()).default([]),
});

export const updateBrandSchema = z.object({
  name: z.string().min(1).optional(),
  domain: z.string().url().optional().nullable(),
  keywords: z.array(z.string()).optional(),
  competitors: z.array(z.string()).optional(),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
