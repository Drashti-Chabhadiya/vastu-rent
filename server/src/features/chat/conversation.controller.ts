import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../../config/prisma.js'
import { auth } from '../../config/auth.js'
import { isUserOnline } from '../user/user.controller.js'
import { broadcastToConversation, broadcastToUser } from '../../lib/supabase.js'

export const conversationController = {
  async getConversations(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
    const userId = session.user.id

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ participantOneId: userId }, { participantTwoId: userId }],
      },
      include: {
        participantOne: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            showProfile: true,
            showOnline: true,
            lastActive: true,
            isGreenMember: true,
          },
        },
        participantTwo: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            showProfile: true,
            showOnline: true,
            lastActive: true,
            isGreenMember: true,
          },
        },
        messages: {
          where: {
            NOT: {
              deletedBy: {
                has: userId,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const userShowOnline = (session.user as any).showOnline !== false

    const formatted = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser =
          conv.participantOneId === userId
            ? conv.participantTwo
            : conv.participantOne

        const disappearingDuration = conv.disappearingDuration || 0
        const cutoff =
          disappearingDuration > 0
            ? new Date(Date.now() - disappearingDuration * 1000)
            : null

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: otherUser.id,
            isRead: false,
            createdAt: cutoff ? { gte: cutoff } : undefined,
          },
        })

        let lastMessage: any = conv.messages[0] || null
        if (lastMessage && cutoff && new Date(lastMessage.createdAt) < cutoff) {
          lastMessage = null
        }

        const isBlockedByOther = (conv.blockedBy || []).includes(otherUser.id)
        const isBlockedByMe = (conv.blockedBy || []).includes(userId)

        const otherUserShowOnline = (otherUser as any).showOnline !== false
        const canSeeStatus =
          userShowOnline &&
          otherUserShowOnline &&
          !isBlockedByOther &&
          !isBlockedByMe

        const isOnline = canSeeStatus
          ? isUserOnline((otherUser as any).lastActive)
          : false
        const lastActive = canSeeStatus ? (otherUser as any).lastActive : null

        return {
          id: conv.id,
          updatedAt: conv.updatedAt,
          pinnedBy: conv.pinnedBy || [],
          mutedBy: conv.mutedBy || [],
          archivedBy: conv.archivedBy || [],
          blockedBy: conv.blockedBy || [],
          reportedBy: conv.reportedBy || [],
          isArchived: (conv.archivedBy || []).includes(userId),
          disappearingDuration,
          settings: conv.settings || null,
          otherParticipant: {
            id: otherUser.id,
            name: otherUser.name,
            role: otherUser.role,
            image:
              (otherUser as any).showProfile === false || isBlockedByOther
                ? null
                : otherUser.image,
            isOnline,
            lastActive,
            isGreenMember: (otherUser as any).isGreenMember === true,
          },
          unreadCount,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                senderId: lastMessage.senderId,
                isRead: lastMessage.isRead,
                createdAt: lastMessage.createdAt,
              }
            : null,
        }
      }),
    )

    return formatted
  },

  async getOrCreateConversation(request: FastifyRequest, reply: FastifyReply) {
    const { targetUserId } = request.body as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
    const userId = session.user.id

    if (!targetUserId) {
      return reply.status(400).send({ message: 'targetUserId is required' })
    }

    if (userId === targetUserId) {
      return reply.status(400).send({ message: 'Cannot chat with yourself' })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, image: true },
    })

    if (!targetUser) {
      return reply.status(404).send({ message: 'Target user not found' })
    }

    const [p1, p2] =
      userId < targetUserId ? [userId, targetUserId] : [targetUserId, userId]

    let conversation = await prisma.conversation.findFirst({
      where: {
        participantOneId: p1,
        participantTwoId: p2,
      },
      include: {
        participantOne: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            showProfile: true,
            showOnline: true,
            lastActive: true,
            isGreenMember: true,
          },
        },
        participantTwo: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            showProfile: true,
            showOnline: true,
            lastActive: true,
            isGreenMember: true,
          },
        },
      },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantOneId: p1,
          participantTwoId: p2,
        },
        include: {
          participantOne: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
              showProfile: true,
              showOnline: true,
              lastActive: true,
              isGreenMember: true,
            },
          },
          participantTwo: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
              showProfile: true,
              showOnline: true,
              lastActive: true,
              isGreenMember: true,
            },
          },
        },
      })
    }

    if (!conversation) {
      return reply
        .status(500)
        .send({ message: 'Failed to establish conversation' })
    }

    const userShowOnline = (session.user as any).showOnline !== false
    const otherUser =
      conversation.participantOneId === userId
        ? conversation.participantTwo
        : conversation.participantOne

    const isBlockedByOther = (conversation.blockedBy || []).includes(
      otherUser.id,
    )
    const isBlockedByMe = (conversation.blockedBy || []).includes(userId)

    const otherUserShowOnline = (otherUser as any).showOnline !== false
    const canSeeStatus =
      userShowOnline &&
      otherUserShowOnline &&
      !isBlockedByOther &&
      !isBlockedByMe

    const isOnline = canSeeStatus
      ? isUserOnline((otherUser as any).lastActive)
      : false
    const lastActive = canSeeStatus ? (otherUser as any).lastActive : null

    return {
      id: conversation.id,
      updatedAt: conversation.updatedAt,
      pinnedBy: conversation.pinnedBy || [],
      mutedBy: conversation.mutedBy || [],
      archivedBy: conversation.archivedBy || [],
      blockedBy: conversation.blockedBy || [],
      reportedBy: conversation.reportedBy || [],
      isArchived: (conversation.archivedBy || []).includes(userId),
      disappearingDuration: conversation.disappearingDuration || 0,
      settings: conversation.settings || null,
      otherParticipant: {
        id: otherUser.id,
        name: otherUser.name,
        role: otherUser.role,
        image:
          (otherUser as any).showProfile === false || isBlockedByOther
            ? null
            : otherUser.image,
        isOnline,
        lastActive,
        isGreenMember: (otherUser as any).isGreenMember === true,
      },
    }
  },

  async updateConversationSettings(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { id: conversationId } = request.params as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
    const userId = session.user.id
    const { wallpaper, theme } = request.body as any

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return reply.status(404).send({ message: 'Conversation not found' })
    }

    if (
      conversation.participantOneId !== userId &&
      conversation.participantTwoId !== userId
    ) {
      return reply.status(403).send({ message: 'Forbidden' })
    }

    const existingSettings = conversation.settings || {}
    const currentSettings = (existingSettings as any)[userId] || {}
    const updatedUserSettings = {
      ...currentSettings,
      ...(wallpaper !== undefined ? { wallpaper } : {}),
      ...(theme !== undefined ? { theme } : {}),
    }

    const updatedSettings = {
      ...(existingSettings as any),
      [userId]: updatedUserSettings,
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        settings: updatedSettings,
      },
    })

    return {
      id: updatedConversation.id,
      settings: updatedConversation.settings || null,
    }
  },

  async deleteConversation(request: FastifyRequest, reply: FastifyReply) {
    const { id: conversationId } = request.params as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
    const userId = session.user.id

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return reply.status(404).send({ message: 'Conversation not found' })
    }

    if (
      conversation.participantOneId !== userId &&
      conversation.participantTwoId !== userId
    ) {
      return reply.status(403).send({ message: 'Forbidden' })
    }

    await prisma.message.deleteMany({ where: { conversationId } })
    await prisma.conversation.delete({ where: { id: conversationId } })

    return { message: 'Conversation deleted' }
  },

  async archiveConversation(request: FastifyRequest, reply: FastifyReply) {
    const { id: conversationId } = request.params as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
    const userId = session.user.id

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })
    if (!conversation) {
      return reply.status(404).send({ message: 'Conversation not found' })
    }
    if (
      conversation.participantOneId !== userId &&
      conversation.participantTwoId !== userId
    ) {
      return reply.status(403).send({ message: 'Forbidden' })
    }

    const archivedBy = conversation.archivedBy || []
    if (!archivedBy.includes(userId)) {
      archivedBy.push(userId)
    }

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: { archivedBy: { set: archivedBy } },
    })

    return {
      id: updated.id,
      archivedBy: updated.archivedBy || [],
      isArchived: (updated.archivedBy || []).includes(userId),
    }
  },

  async unarchiveConversation(request: FastifyRequest, reply: FastifyReply) {
    const { id: conversationId } = request.params as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
    const userId = session.user.id

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })
    if (!conversation) {
      return reply.status(404).send({ message: 'Conversation not found' })
    }
    if (
      conversation.participantOneId !== userId &&
      conversation.participantTwoId !== userId
    ) {
      return reply.status(403).send({ message: 'Forbidden' })
    }

    const archivedBy = (conversation.archivedBy || []).filter(
      (id) => id !== userId,
    )

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: { archivedBy: { set: archivedBy } },
    })

    return {
      id: updated.id,
      archivedBy: updated.archivedBy || [],
      isArchived: (updated.archivedBy || []).includes(userId),
    }
  },

  async togglePinConversation(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) return reply.status(401).send({ message: 'Unauthorized' })
    const userId = session.user.id

    const conversation = await prisma.conversation.findUnique({ where: { id } })
    if (!conversation)
      return reply.status(404).send({ message: 'Conversation not found' })

    const pinnedBy = conversation.pinnedBy.includes(userId)
      ? conversation.pinnedBy.filter((uid) => uid !== userId)
      : [...conversation.pinnedBy, userId]

    const updated = await prisma.conversation.update({
      where: { id },
      data: { pinnedBy },
    })

    await broadcastToUser(userId, 'conversation_settings_updated', {
      id: updated.id,
      pinnedBy: updated.pinnedBy,
    })

    return updated
  },

  async toggleMuteConversation(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) return reply.status(401).send({ message: 'Unauthorized' })
    const userId = session.user.id

    const conversation = await prisma.conversation.findUnique({ where: { id } })
    if (!conversation)
      return reply.status(404).send({ message: 'Conversation not found' })

    const mutedBy = conversation.mutedBy.includes(userId)
      ? conversation.mutedBy.filter((uid) => uid !== userId)
      : [...conversation.mutedBy, userId]

    const updated = await prisma.conversation.update({
      where: { id },
      data: { mutedBy },
    })

    await broadcastToUser(userId, 'conversation_settings_updated', {
      id: updated.id,
      mutedBy: updated.mutedBy,
    })

    return updated
  },

  async clearChat(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) return reply.status(401).send({ message: 'Unauthorized' })
    const userId = session.user.id

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { messages: true },
    })
    if (!conversation)
      return reply.status(404).send({ message: 'Conversation not found' })

    for (const msg of conversation.messages) {
      if (!msg.deletedBy.includes(userId)) {
        await prisma.message.update({
          where: { id: msg.id },
          data: {
            deletedBy: [...msg.deletedBy, userId],
          },
        })
      }
    }

    await broadcastToUser(userId, 'chat_cleared', { conversationId: id })

    return { message: 'Chat cleared successfully' }
  },

  async setDisappearingMessages(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const { duration } = request.body as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) return reply.status(401).send({ message: 'Unauthorized' })
    const userId = session.user.id

    const conversation = await prisma.conversation.findUnique({ where: { id } })
    if (!conversation)
      return reply.status(404).send({ message: 'Conversation not found' })

    const normalizedDuration =
      duration > 0 && duration <= 720 ? duration * 3600 : duration

    const updated = await prisma.conversation.update({
      where: { id },
      data: { disappearingDuration: normalizedDuration },
    })

    const durationText =
      normalizedDuration === 0
        ? 'turned off disappearing messages'
        : normalizedDuration === 86400
          ? 'set messages to disappear after 24 hours'
          : normalizedDuration === 604800
            ? 'set messages to disappear after 7 days'
            : normalizedDuration === 2592000
              ? 'set messages to disappear after 30 days'
              : `set messages to disappear after ${normalizedDuration / 86400} days`

    const systemMessage = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: userId,
        content: `>>SYSTEM::${session.user.name} ${durationText}.`,
        isRead: true,
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true, showProfile: true },
        },
      },
    })

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    })

    await broadcastToConversation(id, 'new_message', systemMessage)
    await broadcastToConversation(id, 'conversation_settings_updated', {
      id: updated.id,
      disappearingDuration: updated.disappearingDuration,
    })

    const otherParticipantId =
      conversation.participantOneId === userId
        ? conversation.participantTwoId
        : conversation.participantOneId

    await broadcastToUser(otherParticipantId, 'conversation_updated', {
      conversation: updated,
      lastMessage: systemMessage,
    })

    return updated
  },

  async blockConversation(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) return reply.status(401).send({ message: 'Unauthorized' })
    const userId = session.user.id

    const conversation = await prisma.conversation.findUnique({ where: { id } })
    if (!conversation)
      return reply.status(404).send({ message: 'Conversation not found' })

    if (
      conversation.participantOneId !== userId &&
      conversation.participantTwoId !== userId
    ) {
      return reply.status(403).send({ message: 'Forbidden' })
    }

    const blockedBy = Array.from(
      new Set([...(conversation.blockedBy || []), userId]),
    )

    const updated = await prisma.conversation.update({
      where: { id },
      data: { blockedBy },
    })

    await broadcastToConversation(id, 'conversation_blocked_updated', {
      id: updated.id,
      blockedBy: updated.blockedBy,
    })

    return { id: updated.id, blockedBy: updated.blockedBy }
  },

  async unblockConversation(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) return reply.status(401).send({ message: 'Unauthorized' })
    const userId = session.user.id

    const conversation = await prisma.conversation.findUnique({ where: { id } })
    if (!conversation)
      return reply.status(404).send({ message: 'Conversation not found' })

    if (
      conversation.participantOneId !== userId &&
      conversation.participantTwoId !== userId
    ) {
      return reply.status(403).send({ message: 'Forbidden' })
    }

    const blockedBy = (conversation.blockedBy || []).filter(
      (uid) => uid !== userId,
    )

    const updated = await prisma.conversation.update({
      where: { id },
      data: { blockedBy },
    })

    await broadcastToConversation(id, 'conversation_blocked_updated', {
      id: updated.id,
      blockedBy: updated.blockedBy,
    })

    return { id: updated.id, blockedBy: updated.blockedBy }
  },

  async reportConversation(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const { reason } = request.body as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) return reply.status(401).send({ message: 'Unauthorized' })
    const userId = session.user.id

    const conversation = await prisma.conversation.findUnique({ where: { id } })
    if (!conversation)
      return reply.status(404).send({ message: 'Conversation not found' })

    if (
      conversation.participantOneId !== userId &&
      conversation.participantTwoId !== userId
    ) {
      return reply.status(403).send({ message: 'Forbidden' })
    }

    const reportedBy = Array.from(
      new Set([...(conversation.reportedBy || []), userId]),
    )

    const updated = await prisma.conversation.update({
      where: { id },
      data: { reportedBy },
    })

    console.log(
      `⚠️ User ${session.user.name} reported conversation ${id}. Reason: "${reason || 'No reason provided'}"`,
    )

    return {
      id: updated.id,
      reportedBy: updated.reportedBy,
      message: 'Report submitted successfully',
    }
  },
}
