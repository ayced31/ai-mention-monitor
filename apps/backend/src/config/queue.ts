import { Queue } from "bullmq";
import { redis } from "./redis.js";
import { logger } from "../utils/logger.js";

const connection = redis;

// Queues
export const mentionQueue = new Queue("mentions", { connection });
export const alertQueue = new Queue("alerts", { connection });
export const digestQueue = new Queue("digests", { connection });

// Setup repeating jobs
export async function setupScheduledJobs() {
  // Check mentions every hour for active queries
  await mentionQueue.add(
    "scheduled-check",
    {},
    {
      repeat: { pattern: "0 * * * *" }, // Every hour
      removeOnComplete: true,
    }
  );

  // Weekly digest every Monday at 9 AM
  await digestQueue.add(
    "weekly-digest",
    {},
    {
      repeat: { pattern: "0 9 * * 1" },
      removeOnComplete: true,
    }
  );

  logger.info("Scheduled jobs configured");
}
