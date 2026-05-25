import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../config/prisma.js";
import { auth } from "../../config/auth.js";
import { isUserOnline } from "../../lib/socket.js";

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
        participantOne: { select: { id: true, name: true, image: true, role: true } },
        participantTwo: { select: { id: true, name: true, image: true, role: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        }
      },
      orderBy: { updatedAt: "desc" }
    });

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

      return {
        id: conv.id,
        updatedAt: conv.updatedAt,
        otherParticipant: {
          ...otherUser,
          isOnline: isUserOnline(otherUser.id),
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
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, image: true } }
      },
      orderBy: { createdAt: "asc" }
    });

    return messages;
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
        participantOne: { select: { id: true, name: true, image: true, role: true } },
        participantTwo: { select: { id: true, name: true, image: true, role: true } },
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
          participantOne: { select: { id: true, name: true, image: true, role: true } },
          participantTwo: { select: { id: true, name: true, image: true, role: true } },
        }
      });
    }

    const otherUser = conversation.participantOneId === userId ? conversation.participantTwo : conversation.participantOne;

    return {
      id: conversation.id,
      updatedAt: conversation.updatedAt,
      otherParticipant: {
        ...otherUser,
        isOnline: isUserOnline(otherUser.id)
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

    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
        banned: false,
        name: q ? { contains: q, mode: "insensitive" } : undefined,
      },
      select: { id: true, name: true, image: true, role: true },
      take: 15,
      orderBy: { name: "asc" },
    });

    return users.map((u) => ({ ...u, isOnline: isUserOnline(u.id) }));
  }
}

export const chatController = new ChatController();
