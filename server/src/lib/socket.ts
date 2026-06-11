import { Server as SocketIOServer } from "socket.io";
import { prisma } from "../config/prisma.js";

// Store online users mapping: userId -> array of socketIds
export const onlineUsers = new Map<string, string[]>();

export let io: SocketIOServer | null = null;

export function initSocket(httpServer: any) {
  const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
  const allowedOrigins = [
    clientUrl,
    "http://localhost:3000",
    "https://new-vastu-rent-client.vercel.app",
  ];

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        const isLocalOrCapacitor =
          allowedOrigins.includes(origin) ||
          origin.startsWith('capacitor://') ||
          origin.startsWith('http://localhost') ||
          origin.startsWith('https://localhost') ||
          /\/\/(127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin);

        if (isLocalOrCapacitor) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed`));
        }
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
    // Allow both polling and websocket, starting with polling for reliability
    transports: ["polling", "websocket"],
    // Ping settings to detect stale connections quickly
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Secure socket connections with authentication using better-auth session tokens
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token || typeof token !== "string") {
        return next(new Error("Authentication token missing"));
      }

      // Look up session in the database
      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!session) {
        return next(new Error("Invalid session"));
      }

      if (new Date(session.expiresAt) < new Date()) {
        return next(new Error("Session expired"));
      }

      // Attach user details to socket data
      socket.data.user = session.user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Internal server error"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    const userId = user.id;

    console.log(`🔌 Socket connected: User ${user.name} (${userId}) - Socket ${socket.id}`);

    // Add socket to online users mapping
    const userSockets = onlineUsers.get(userId) || [];
    userSockets.push(socket.id);
    onlineUsers.set(userId, userSockets);

    // Broadcast online status update to all connected clients (only if they allow online status)
    if (user.showOnline !== false) {
      io?.emit("user_status", { userId, status: "online", lastActive: user.lastActive });
    }

    // Join user's personal room for direct notifications
    socket.join(`user_${userId}`);

    // Offline-to-Online Delivery updates
    (async () => {
      try {
        const undeliveredMessages = await prisma.message.findMany({
          where: {
            conversation: {
              OR: [
                { participantOneId: userId },
                { participantTwoId: userId }
              ]
            },
            senderId: { not: userId },
            deliveredAt: null,
            readAt: null
          },
          select: {
            id: true,
            conversationId: true,
            senderId: true
          }
        });

        if (undeliveredMessages.length > 0) {
          const now = new Date();
          await prisma.message.updateMany({
            where: {
              id: { in: undeliveredMessages.map(m => m.id) }
            },
            data: {
              deliveredAt: now
            }
          });

          // Group by sender and notify them
          const sendersToNotify = new Set(undeliveredMessages.map(m => m.senderId));
          sendersToNotify.forEach(senderId => {
            const senderMsgs = undeliveredMessages.filter(m => m.senderId === senderId).map(m => m.id);
            io?.to(`user_${senderId}`).emit("messages_delivered", {
              recipientId: userId,
              messageIds: senderMsgs,
              deliveredAt: now.toISOString()
            });
          });
        }
      } catch (err) {
        console.error("Error setting delivered status for pending messages:", err);
      }
    })();

    // --- SOCKET ROOM / CONVERSATION CHAT EVENTS ---

    // Join a conversation room
    socket.on("join_conversation", async ({ conversationId }) => {
      if (!conversationId) return;

      socket.join(`conversation_${conversationId}`);
      console.log(`💬 Socket ${socket.id} joined conversation: ${conversationId}`);

      // Automatically mark all messages in this conversation sent by other participant as read
      try {
        const now = new Date();
        await prisma.message.updateMany({
          where: {
            conversationId,
            senderId: { not: userId },
            isRead: false,
          },
          data: {
            isRead: true,
            readAt: now,
            deliveredAt: now
          },
        });

        // Notify other participants in the room that their messages have been read
        socket.to(`conversation_${conversationId}`).emit("messages_read", {
          conversationId,
          readAt: now.toISOString()
        });
      } catch (err) {
        console.error("Error marking messages as read on join:", err);
      }
    });

    // Send a message
    socket.on("send_message", async ({ conversationId, content, attachments }) => {
      // Allow sending with either content or attachments (or both)
      const hasContent = content && content.trim();
      const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
      if (!conversationId || (!hasContent && !hasAttachments)) return;

      try {
        // Double-check user is part of the conversation
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });

        if (!conversation) {
          return socket.emit("error", { message: "Conversation not found" });
        }

        if (conversation.participantOneId !== userId && conversation.participantTwoId !== userId) {
          return socket.emit("error", { message: "Unauthorized in this conversation" });
        }

        const otherParticipantId = conversation.participantOneId === userId
          ? conversation.participantTwoId
          : conversation.participantOneId;

        // Check if recipient is active in this room
        const socketsInRoom = await io?.in(`conversation_${conversationId}`).fetchSockets();
        const isOtherUserActiveInChat = socketsInRoom?.some((s) => s.data?.user?.id === otherParticipantId);

        let isRead = false;
        let readAt: Date | null = null;
        let deliveredAt: Date | null = null;

        if (isOtherUserActiveInChat) {
          isRead = true;
          readAt = new Date();
          deliveredAt = new Date();
        } else if (isUserOnline(otherParticipantId)) {
          deliveredAt = new Date();
        }

        // Store chat message in the database
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            content: hasContent ? content.trim() : "",
            attachments: hasAttachments ? attachments : [],
            isRead,
            readAt,
            deliveredAt,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
                showProfile: true,
              },
            },
          },
        });

        // Update the conversation's updatedAt field
        const updatedConv = await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
          include: {
            participantOne: { select: { id: true, name: true, image: true, showProfile: true } },
            participantTwo: { select: { id: true, name: true, image: true, showProfile: true } },
          }
        });

        // Broadcast sanitized message to conversation room (so other user doesn't see image if showProfile is false)
        const payloadMessage = {
          ...message,
          sender: {
            ...message.sender,
            image: message.sender.showProfile === false ? null : message.sender.image,
          }
        };
        io?.to(`conversation_${conversationId}`).emit("new_message", payloadMessage);

        // Emit conversation_updated directly to other participant's personal room with sanitized images
        const sanitizedConv = {
          ...updatedConv,
          participantOne: {
            ...updatedConv.participantOne,
            image: (updatedConv.participantOne as any).showProfile === false ? null : updatedConv.participantOne.image,
          },
          participantTwo: {
            ...updatedConv.participantTwo,
            image: (updatedConv.participantTwo as any).showProfile === false ? null : updatedConv.participantTwo.image,
          }
        };

        io?.to(`user_${otherParticipantId}`).emit("conversation_updated", {
          conversation: sanitizedConv,
          lastMessage: payloadMessage,
        });

        // Smart Notification Trigger: only notify recipient if they are not currently in the chat room
        try {
          if (!isOtherUserActiveInChat) {
            const { createAndDeliverNotification } = await import('./notification.js');
            const notifMessage = hasAttachments && !hasContent
              ? `📎 Sent ${attachments.length} image${attachments.length > 1 ? 's' : ''}`
              : (content.trim().length > 80 ? `${content.trim().substring(0, 80)}...` : content.trim());
            await createAndDeliverNotification({
              userId: otherParticipantId,
              title: `New message from ${user.name} 💬`,
              message: notifMessage,
              type: "info",
            });
          }
        } catch (err) {
          console.error("Failed to deliver message notification:", err);
        }

      } catch (err) {
        console.error("Error storing and broadcasting message:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing Indicators
    socket.on("typing", ({ conversationId, isTyping }) => {
      if (!conversationId) return;
      socket.to(`conversation_${conversationId}`).emit("typing", {
        conversationId,
        userId,
        isTyping,
      });
    });

    // Seen / Read message status explicitly triggered
    socket.on("mark_read", async ({ conversationId }) => {
      if (!conversationId) return;

      try {
        const now = new Date();
        await prisma.message.updateMany({
          where: {
            conversationId,
            senderId: { not: userId },
            isRead: false,
          },
          data: {
            isRead: true,
            readAt: now,
            deliveredAt: now
          },
        });

        io?.to(`conversation_${conversationId}`).emit("messages_read", {
          conversationId,
          readAt: now.toISOString()
        });
      } catch (err) {
        console.error("Error marking messages read:", err);
      }
    });

    // Socket disconnection presence tracking
    socket.on("disconnect", async () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);

      const userSockets = onlineUsers.get(userId) || [];
      const updatedSockets = userSockets.filter((id) => id !== socket.id);

      if (updatedSockets.length > 0) {
        onlineUsers.set(userId, updatedSockets);
      } else {
        onlineUsers.delete(userId);

        try {
          // Update lastActive timestamp in database
          const now = new Date();
          await prisma.user.update({
            where: { id: userId },
            data: { lastActive: now }
          });

          // Fetch current setting from database to ensure fresh state
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { showOnline: true }
          });

          if (dbUser?.showOnline !== false) {
            // Broadcast offline status update
            io?.emit("user_status", { userId, status: "offline", lastActive: now });
          }
        } catch (err) {
          console.error("Error setting offline presence/lastActive:", err);
        }
      }
    });
  });
}

// Helper function to check if a user is online
export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}
