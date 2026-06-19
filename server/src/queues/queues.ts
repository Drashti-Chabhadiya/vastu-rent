import { Queue } from "bullmq";
import { bullMQConnection } from "../config/bullmq.js";
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
  connection: bullMQConnection,
  defaultJobOptions,
});

export const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATION, {
  connection: bullMQConnection,
  defaultJobOptions,
});

export const imageQueue = new Queue(QUEUE_NAMES.IMAGE, {
  connection: bullMQConnection,
  defaultJobOptions,
});

export const rentalQueue = new Queue(QUEUE_NAMES.RENTAL, {
  connection: bullMQConnection,
  defaultJobOptions,
});

export const chatQueue = new Queue(QUEUE_NAMES.CHAT, {
  connection: bullMQConnection,
  defaultJobOptions,
});
