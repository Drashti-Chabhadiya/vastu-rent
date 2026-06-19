import { Worker } from "bullmq";
import { bullMQConnection } from "../../config/bullmq.js";
import { sendPushToUser } from "../../lib/fcm.js";
import {
  sendVerificationEmailDirect,
  sendResetPasswordEmailDirect,
  sendBookingAlertEmailDirect,
  sendEmailNotificationsConfirmationEmailDirect,
  sendMarketingWelcomeEmailDirect,
  sendContactSupportEmailDirect,
} from "../../lib/mail.js";
import { QUEUE_NAMES, JOB_NAMES } from "../../constants/queue-keys.js";

export const notificationWorker = new Worker(
  QUEUE_NAMES.NOTIFICATION,
  async (job) => {
    const { name, data } = job;
    console.log(`[Notification Worker] Processing job: ${name} (ID: ${job.id})`);

    try {
      if (name === JOB_NAMES.NOTIFICATION.PUSH_NOTIFICATION) {
        const { userId, title, body, url, image, data: payloadData } = data;
        if (!userId || !title || !body) {
          throw new Error("Missing parameters for push-notification job");
        }

        // Call our existing FCM function
        await sendPushToUser(userId, {
          title,
          body,
          url: url || "/notifications",
          image: image || "",
          data: payloadData || {},
        });
        console.log(`[Notification Worker] FCM Push sent successfully to user ${userId}`);
      } else if (name === JOB_NAMES.NOTIFICATION.SEND_EMAIL) {
        const { type, emailData } = data;
        if (!type || !emailData) {
          throw new Error("Missing parameters for send-email job");
        }

        console.log(`[Notification Worker] Sending email of type: ${type} to ${emailData.email || "support"}`);

        switch (type) {
          case "verification":
            await sendVerificationEmailDirect(emailData);
            break;
          case "reset-password":
            await sendResetPasswordEmailDirect(emailData);
            break;
          case "booking-alert":
            await sendBookingAlertEmailDirect(emailData);
            break;
          case "preference-confirmation":
            await sendEmailNotificationsConfirmationEmailDirect(emailData);
            break;
          case "welcome":
            await sendMarketingWelcomeEmailDirect(emailData);
            break;
          case "support":
            await sendContactSupportEmailDirect(emailData);
            break;
          default:
            throw new Error(`Unsupported email type: ${type}`);
        }
        console.log(`[Notification Worker] Email type ${type} sent successfully`);
      } else {
        console.warn(`[Notification Worker] Unknown job type: ${name}`);
      }
    } catch (error: any) {
      console.error(`❌ [Notification Worker] Error executing job ${name}:`, error.message);
      throw error;
    }
  },
  {
    connection: bullMQConnection,
    concurrency: 5, // Allow up to 5 concurrent email/push sends
  }
);

notificationWorker.on("failed", (job, err) => {
  console.error(`❌ [Notification Worker] Job ${job?.id} failed with error:`, err.message);
});

notificationWorker.on("completed", (job) => {
  console.log(`✅ [Notification Worker] Job ${job.id} completed successfully`);
});
