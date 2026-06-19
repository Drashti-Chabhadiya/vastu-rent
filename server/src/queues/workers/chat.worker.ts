import { Worker } from "bullmq";
import { bullMQConnection } from "../../config/bullmq.js";
import { prisma } from "../../config/prisma.js";
import { io } from "../../lib/socket.js";
import { createAndDeliverNotification } from "../../lib/notification.js";
import { QUEUE_NAMES, JOB_NAMES } from "../../constants/queue-keys.js";

export const chatWorker = new Worker(
  QUEUE_NAMES.CHAT,
  async (job) => {
    const { name, data } = job;
    console.log(`[Chat Worker] Processing job: ${name} (ID: ${job.id})`);

    try {
      if (name === JOB_NAMES.CHAT.UNREAD_COUNT) {
        const { userId } = data;
        if (!userId) {
          throw new Error("Missing userId for unread-count job");
        }

        // Count all unread messages for this user across all conversations
        const unreadCount = await prisma.message.count({
          where: {
            conversation: {
              OR: [
                { participantOneId: userId },
                { participantTwoId: userId },
              ],
            },
            senderId: { not: userId },
            isRead: false,
          },
        });

        // Broadcast the updated count to the user's socket room
        if (io) {
          console.log(`[Chat Worker] Broadcasting unread count (${unreadCount}) to user_${userId}`);
          io.to(`user_${userId}`).emit("unread_count", { unreadCount });
        }
      } else if (name === JOB_NAMES.CHAT.MESSAGE_NOTIFICATION) {
        const { messageId, recipientId } = data;
        if (!messageId || !recipientId) {
          throw new Error("Missing parameters for message-notification job");
        }

        // Fetch message details
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          include: {
            sender: {
              select: {
                name: true,
              },
            },
            conversation: true,
          },
        });

        if (!message) {
          console.warn(`[Chat Worker] Message ${messageId} not found. Skipping notification.`);
          return;
        }

        // If the message has already been read, skip notifying
        if (message.isRead) {
          console.log(`[Chat Worker] Message ${messageId} is already marked read. Skipping notification.`);
          return;
        }

        // Check if recipient has muted this conversation
        const isMuted = message.conversation.mutedBy?.includes(recipientId) ?? false;
        if (isMuted) {
          console.log(`[Chat Worker] Conversation ${message.conversationId} is muted by recipient ${recipientId}. Skipping notification.`);
          return;
        }

        // Check if recipient is active in the conversation room right now
        let isRecipientActive = false;
        if (io) {
          const socketsInRoom = await io.in(`conversation_${message.conversationId}`).fetchSockets();
          isRecipientActive = socketsInRoom.some((s) => s.data?.user?.id === recipientId);
        }

        if (isRecipientActive) {
          console.log(`[Chat Worker] Recipient ${recipientId} is currently active in the chat. Skipping background notification.`);
          return;
        }

        // Build notification content
        const hasAttachments = message.attachments && message.attachments.length > 0;
        const notifMessage = hasAttachments && !message.content
          ? `📎 Sent ${message.attachments.length} image${message.attachments.length > 1 ? "s" : ""}`
          : message.content.length > 80
          ? `${message.content.substring(0, 80)}...`
          : message.content;

        console.log(`[Chat Worker] Triggering background notification for user ${recipientId}`);
        await createAndDeliverNotification({
          userId: recipientId,
          title: `New message from ${message.sender.name || "User"} 💬`,
          message: notifMessage,
          type: "info",
          url: `/chat/${message.conversationId}`,
        });
      } else {
        console.warn(`[Chat Worker] Unknown job type: ${name}`);
      }
    } catch (error: any) {
      console.error(`❌ [Chat Worker] Error executing job ${name}:`, error.message);
      throw error;
    }
  },
  {
    connection: bullMQConnection,
    concurrency: 10, // Handle up to 10 concurrent chat operations
  }
);

chatWorker.on("failed", (job, err) => {
  console.error(`❌ [Chat Worker] Job ${job?.id} failed with error:`, err.message);
});

chatWorker.on("completed", (job) => {
  console.log(`✅ [Chat Worker] Job ${job.id} completed successfully`);
});
