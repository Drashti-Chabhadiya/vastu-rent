import { Queue } from "bullmq";
import { redis } from "../config/redis.js";
import { QUEUE_NAMES } from "../constants/queue-keys.js";

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000,
  },
  removeOnComplete: {
    age: 24 * 3600, // 24 hours
    count: 1000,
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // 7 days
    count: 5000,
  },
};

export const paymentQueue = new Queue(QUEUE_NAMES.PAYMENT, {
  connection: redis as any,
  defaultJobOptions,
});

export const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATION, {
  connection: redis as any,
  defaultJobOptions,
});

export const imageQueue = new Queue(QUEUE_NAMES.IMAGE, {
  connection: redis as any,
  defaultJobOptions,
});

export const rentalQueue = new Queue(QUEUE_NAMES.RENTAL, {
  connection: redis as any,
  defaultJobOptions,
});

export const chatQueue = new Queue(QUEUE_NAMES.CHAT, {
  connection: redis as any,
  defaultJobOptions,
});

export async function closeQueues() {
  try {
    await Promise.all([
      paymentQueue.close(),
      notificationQueue.close(),
      imageQueue.close(),
      rentalQueue.close(),
      chatQueue.close(),
    ]);
    console.log("📁 [BullMQ] All queues closed cleanly.");
  } catch (err: any) {
    console.error("❌ [BullMQ] Error closing queues:", err.message);
  }
}
