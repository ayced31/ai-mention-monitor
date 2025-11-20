import { z } from 'zod';

const emailConfigSchema = z.object({
  email: z.string().email(),
});

const slackConfigSchema = z.object({
  webhookUrl: z.string().url(),
  channel: z.string().optional(),
});

const webhookConfigSchema = z.object({
  url: z.string().url(),
  headers: z.record(z.string()).optional(),
});

export const createAlertSchema = z.object({
  type: z.enum(['MENTION_DETECTED', 'MENTION_LOST', 'COMPETITOR_MENTIONED', 'WEEKLY_DIGEST']),
  channel: z.enum(['EMAIL', 'SLACK', 'WEBHOOK']),
  config: z.union([emailConfigSchema, slackConfigSchema, webhookConfigSchema]),
  threshold: z.number().int().min(0).optional(),
  isActive: z.boolean().default(true),
});

export const updateAlertSchema = z.object({
  type: z.enum(['MENTION_DETECTED', 'MENTION_LOST', 'COMPETITOR_MENTIONED', 'WEEKLY_DIGEST']).optional(),
  channel: z.enum(['EMAIL', 'SLACK', 'WEBHOOK']).optional(),
  config: z.union([emailConfigSchema, slackConfigSchema, webhookConfigSchema]).optional(),
  threshold: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
