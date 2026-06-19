import { paymentWorker } from "./workers/payment.worker.js";
import { notificationWorker } from "./workers/notification.worker.js";
import { imageWorker } from "./workers/image.worker.js";
import { rentalWorker } from "./workers/rental.worker.js";
import { chatWorker } from "./workers/chat.worker.js";
import { rentalQueue } from "./queues.js";
import { JOB_NAMES } from "../constants/queue-keys.js";

export async function initWorkers() {
  console.log("👷 [BullMQ] Initializing background workers...");

  // Keep references to prevent tree-shaking / garbage collection of background workers
  const workers = [
    paymentWorker,
    notificationWorker,
    imageWorker,
    rentalWorker,
    chatWorker,
  ];

  console.log(`[BullMQ] Workers registered and active: ${workers.map((w) => w.name).join(", ")}`);

  try {
    // Clear existing repeatable jobs to avoid duplicates during server reloads (hot reloads)
    const repeatableJobs = await rentalQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await rentalQueue.removeRepeatableByKey(job.key);
      console.log(`[BullMQ] Cleared legacy repeatable job: ${job.name}`);
    }

    // Register repeatable job: auto-expiry (every hour)
    await rentalQueue.add(
      JOB_NAMES.RENTAL.AUTO_EXPIRY,
      {},
      {
        repeat: {
          pattern: "0 * * * *", // every hour
        },
      }
    );
    console.log(`⏰ [BullMQ] Scheduled repeatable task: '${JOB_NAMES.RENTAL.AUTO_EXPIRY}' (every hour)`);

    // Register repeatable job: send-reminders (every 12 hours)
    await rentalQueue.add(
      JOB_NAMES.RENTAL.SEND_REMINDERS,
      {},
      {
        repeat: {
          pattern: "0 */12 * * *", // every 12 hours
        },
      }
    );
    console.log(`⏰ [BullMQ] Scheduled repeatable task: '${JOB_NAMES.RENTAL.SEND_REMINDERS}' (every 12 hours)`);
  } catch (err: any) {
    console.error("❌ [BullMQ] Error registering repeatable schedules:", err.message);
  }
}
