import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../config/prisma.js";
import { auth } from "../../config/auth.js";
import { isUserOnline, io } from "../../lib/socket.js";
import { cloudinaryService } from "../upload/cloudinary.service.js";

export class ChatController {
  async getConversations(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
    const userId = session.user.id;

    // Load all conversations where the logged in user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participantOneId: userId },
          { participantTwoId: userId }
        ]
      },
      include: {
        participantOne: { select: { id: true, name: true, image: true, role: true, showProfile: true, showOnline: true, lastActive: true, isGreenMember: true } },
        participantTwo: { select: { id: true, name: true, image: true, role: true, showProfile: true, showOnline: true, lastActive: true, isGreenMember: true } },
        messages: {
          where: {
            NOT: {
              deletedBy: {
                has: userId
              }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    const userShowOnline = (session.user as any).showOnline !== false;

    // Format conversations with participant metadata, last message, unread count, and online status
    const formatted = await Promise.all(conversations.map(async (conv) => {
      const otherUser = conv.participantOneId === userId ? conv.participantTwo : conv.participantOne;

      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: otherUser.id,
          isRead: false
        }
      });

      const lastMessage = conv.messages[0] || null;

      // Reciprocal Online/Last Seen status rules
      const otherUserShowOnline = (otherUser as any).showOnline !== false;
      const canSeeStatus = userShowOnline && otherUserShowOnline;

      const isOnline = canSeeStatus ? isUserOnline(otherUser.id) : false;
      const lastActive = canSeeStatus ? (otherUser as any).lastActive : null;

      return {
        id: conv.id,
        updatedAt: conv.updatedAt,
        otherParticipant: {
          id: otherUser.id,
          name: otherUser.name,
          role: otherUser.role,
          image: (otherUser as any).showProfile === false ? null : otherUser.image,
          isOnline,
          lastActive,
          isGreenMember: (otherUser as any).isGreenMember === true,
        },
        unreadCount,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          senderId: lastMessage.senderId,
          isRead: lastMessage.isRead,
          createdAt: lastMessage.createdAt,
        } : null,
      };
    }));

    return formatted;
  }

  async getMessages(request: FastifyRequest, reply: FastifyReply) {
    const { id: conversationId } = request.params as any;
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
    const userId = session.user.id;

    // Verify user is in conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return reply.status(404).send({ message: "Conversation not found" });
    }

    if (conversation.participantOneId !== userId && conversation.participantTwoId !== userId) {
      return reply.status(403).send({ message: "Forbidden" });
    }

    // Load historical messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        NOT: {
          deletedBy: {
            has: userId
          }
        }
      },
      include: {
        sender: { select: { id: true, name: true, image: true, showProfile: true } }
      },
      orderBy: { createdAt: "asc" }
    });

    return messages.map((m) => {
      if (m.sender.id !== userId && (m.sender as any).showProfile === false) {
        m.sender.image = null;
      }
      return m;
    });
  }

  async getOrCreateConversation(request: FastifyRequest, reply: FastifyReply) {
    const { targetUserId } = request.body as any;
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
    const userId = session.user.id;

    if (!targetUserId) {
      return reply.status(400).send({ message: "targetUserId is required" });
    }

    if (userId === targetUserId) {
      return reply.status(400).send({ message: "Cannot chat with yourself" });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, image: true }
    });

    if (!targetUser) {
      return reply.status(404).send({ message: "Target user not found" });
    }

    // A 1-to-1 conversation has participantOneId < participantTwoId to ensure database uniqueness
    const [p1, p2] = userId < targetUserId ? [userId, targetUserId] : [targetUserId, userId];

    // Find existing conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        participantOneId_participantTwoId: {
          participantOneId: p1,
          participantTwoId: p2
        }
      },
      include: {
        participantOne: { select: { id: true, name: true, image: true, role: true, showProfile: true, showOnline: true, lastActive: true, isGreenMember: true } },
        participantTwo: { select: { id: true, name: true, image: true, role: true, showProfile: true, showOnline: true, lastActive: true, isGreenMember: true } },
      }
    });

    // Create a new conversation if it doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantOneId: p1,
          participantTwoId: p2
        },
        include: {
          participantOne: { select: { id: true, name: true, image: true, role: true, showProfile: true, showOnline: true, lastActive: true, isGreenMember: true } },
          participantTwo: { select: { id: true, name: true, image: true, role: true, showProfile: true, showOnline: true, lastActive: true, isGreenMember: true } },
        }
      });
    }

    if (!conversation) {
      return reply.status(500).send({ message: "Failed to establish conversation" });
    }

    const userShowOnline = (session.user as any).showOnline !== false;
    const otherUser = conversation.participantOneId === userId ? conversation.participantTwo : conversation.participantOne;

    // Reciprocal Online/Last Seen status rules
    const otherUserShowOnline = (otherUser as any).showOnline !== false;
    const canSeeStatus = userShowOnline && otherUserShowOnline;

    const isOnline = canSeeStatus ? isUserOnline(otherUser.id) : false;
    const lastActive = canSeeStatus ? (otherUser as any).lastActive : null;

    return {
      id: conversation.id,
      updatedAt: conversation.updatedAt,
      otherParticipant: {
        id: otherUser.id,
        name: otherUser.name,
        role: otherUser.role,
        image: (otherUser as any).showProfile === false ? null : otherUser.image,
        isOnline,
        lastActive,
        isGreenMember: (otherUser as any).isGreenMember === true,
      }
    };
  }
  async searchUsers(request: FastifyRequest, reply: FastifyReply) {
    const { q } = request.query as any;
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
    const userId = session.user.id;
    const userShowOnline = (session.user as any).showOnline !== false;

    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
        banned: false,
        name: q ? { contains: q, mode: "insensitive" } : undefined,
      },
      select: { id: true, name: true, image: true, role: true, showProfile: true, showOnline: true, lastActive: true, isGreenMember: true },
      take: 15,
      orderBy: { name: "asc" },
    });

    return users.map((u) => {
      const otherUserShowOnline = u.showOnline !== false;
      const canSeeStatus = userShowOnline && otherUserShowOnline;

      return {
        id: u.id,
        name: u.name,
        role: u.role,
        image: u.showProfile === false ? null : u.image,
        isOnline: canSeeStatus ? isUserOnline(u.id) : false,
        lastActive: canSeeStatus ? u.lastActive : null,
        isGreenMember: u.isGreenMember === true,
      };
    });
  }
  async uploadChatAttachment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const session = (request as any).chatSession ||
        await auth.api.getSession({ headers: request.headers as any });
      if (!session) {
        return reply.status(401).send({ message: "Unauthorized" });
      }
      const userId = session.user.id;

      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ message: "No file uploaded" });
      }

      // Validate file type
      if (!data.mimetype.startsWith("image/")) {
        return reply.status(400).send({ message: "Only image files are allowed" });
      }

      const buffer = await data.toBuffer();
      const base64 = `data:${data.mimetype};base64,${buffer.toString("base64")}`;

      // Upload to Cloudinary – use global env creds as fallback if user doesn't have their own
      let url: string;
      try {
        const result = await cloudinaryService.uploadImage(base64, "chat", userId);
        url = result.url;
      } catch {
        // If per-user credentials fail, try global env credentials
        if (
          process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_API_KEY &&
          process.env.CLOUDINARY_API_SECRET
        ) {
          const result = await cloudinaryService.uploadImage(base64, "chat");
          url = result.url;
        } else {
          return reply.status(500).send({ message: "Cloudinary is not configured. Please set up your credentials in settings." });
        }
      }

      return reply.send({ url });
    } catch (error: any) {
      console.error("Chat Attachment Upload Error:", error);
      return reply.status(500).send({ message: error.message || "Upload failed" });
    }
  }

  async deleteConversation(request: FastifyRequest, reply: FastifyReply) {
    const { id: conversationId } = request.params as any;
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
    const userId = session.user.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return reply.status(404).send({ message: "Conversation not found" });
    }

    if (conversation.participantOneId !== userId && conversation.participantTwoId !== userId) {
      return reply.status(403).send({ message: "Forbidden" });
    }

    // Delete all messages first, then the conversation (cascade is set, but being explicit)
    await prisma.message.deleteMany({ where: { conversationId } });
    await prisma.conversation.delete({ where: { id: conversationId } });

    return { message: "Conversation deleted" };
  }

  async editMessage(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const { content } = request.body as any;
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
    const userId = session.user.id;

    if (!content || !content.trim()) {
      return reply.status(400).send({ message: "Content is required" });
    }

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return reply.status(404).send({ message: "Message not found" });
    }

    if (message.senderId !== userId) {
      return reply.status(403).send({ message: "Forbidden" });
    }

    if (message.isDeleted) {
      return reply.status(400).send({ message: "Cannot edit a deleted message" });
    }

    const updated = await prisma.message.update({
      where: { id },
      data: {
        content: content.trim(),
        isEdited: true,
      },
      include: {
        sender: { select: { id: true, name: true, image: true, showProfile: true } }
      }
    });

    // Broadcast update via sockets
    const payload = {
      ...updated,
      sender: {
        ...updated.sender,
        image: updated.sender.showProfile === false ? null : updated.sender.image,
      }
    };
    io?.to(`conversation_${updated.conversationId}`).emit("message_edited", payload);

    return updated;
  }

  async deleteMessage(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const { mode } = request.query as any; // "me" or "everyone"
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
    const userId = session.user.id;

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return reply.status(404).send({ message: "Message not found" });
    }

    // Verify user is in conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: message.conversationId }
    });
    if (!conversation || (conversation.participantOneId !== userId && conversation.participantTwoId !== userId)) {
      return reply.status(403).send({ message: "Forbidden" });
    }

    if (mode === "everyone") {
      if (message.senderId !== userId && session.user.role !== "admin") {
        return reply.status(403).send({ message: "Only the sender or an admin can delete for everyone" });
      }

      // 15-minute time limit for non-admin
      const fifteenMinutes = 15 * 60 * 1000;
      const isWithinTimeLimit = Date.now() - new Date(message.createdAt).getTime() < fifteenMinutes;
      if (!isWithinTimeLimit && session.user.role !== "admin") {
        return reply.status(400).send({ message: "Time limit to delete this message has expired (15 minutes)" });
      }

      const updated = await prisma.message.update({
        where: { id },
        data: {
          isDeleted: true,
          content: "This message was deleted",
          attachments: [],
        },
        include: {
          sender: { select: { id: true, name: true, image: true, showProfile: true } }
        }
      });

      // Broadcast update via sockets
      const payload = {
        id: updated.id,
        conversationId: updated.conversationId,
        isDeleted: true,
        content: updated.content,
        attachments: updated.attachments,
        updatedAt: updated.updatedAt
      };
      io?.to(`conversation_${updated.conversationId}`).emit("message_deleted", payload);

      return updated;
    } else {
      // mode === "me"
      const deletedBy = Array.from(new Set([...message.deletedBy, userId]));
      await prisma.message.update({
        where: { id },
        data: { deletedBy },
      });
      return { message: "Message deleted for me" };
    }
  }

  async forwardMessage(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const { targetConversationIds } = request.body as any; // string[]
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
    const userId = session.user.id;

    if (!Array.isArray(targetConversationIds) || targetConversationIds.length === 0) {
      return reply.status(400).send({ message: "targetConversationIds must be a non-empty array" });
    }

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return reply.status(404).send({ message: "Message not found" });
    }

    const results = [];

    for (const convId of targetConversationIds) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: convId }
      });

      if (!conversation) continue;
      if (conversation.participantOneId !== userId && conversation.participantTwoId !== userId) continue;

      const otherParticipantId = conversation.participantOneId === userId
        ? conversation.participantTwoId
        : conversation.participantOneId;

      // Smart delivery status
      const socketsInRoom = await io?.in(`conversation_${convId}`).fetchSockets();
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

      // Strip reply prefix if present, forward only main message text
      let contentToForward = message.content;
      if (contentToForward.startsWith('>>REPLY_TO::')) {
        const separator = '\u200B\u{1F4AC}\u200B';
        const sepIdx = contentToForward.indexOf(separator);
        if (sepIdx !== -1) {
          contentToForward = contentToForward.slice(sepIdx + separator.length);
        }
      }

      const forwarded = await prisma.message.create({
        data: {
          conversationId: convId,
          senderId: userId,
          content: contentToForward,
          attachments: message.attachments, // copy attachments
          isForwarded: true,
          isRead,
          readAt,
          deliveredAt
        },
        include: {
          sender: { select: { id: true, name: true, image: true, showProfile: true } }
        }
      });

      // Update conversation timestamp
      const updatedConv = await prisma.conversation.update({
        where: { id: convId },
        data: { updatedAt: new Date() },
        include: {
          participantOne: { select: { id: true, name: true, image: true, showProfile: true } },
          participantTwo: { select: { id: true, name: true, image: true, showProfile: true } },
        }
      });

      const payloadMessage = {
        ...forwarded,
        sender: {
          ...forwarded.sender,
          image: forwarded.sender.showProfile === false ? null : forwarded.sender.image,
        }
      };

      // Broadcast to room
      io?.to(`conversation_${convId}`).emit("new_message", payloadMessage);

      // Direct emit conversation update to other participant
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

      results.push(forwarded);
    }

    return results;
  }
}

export const chatController = new ChatController();
