import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../../config/prisma.js'
import { auth } from '../../config/auth.js'
import { isUserOnline } from '../user/user.controller.js'
import { broadcastToConversation, broadcastToUser } from '../../lib/supabase.js'
import { createAndDeliverNotification } from '../../lib/notification.js'

export const messageController = {
  async getMessages(request: FastifyRequest, reply: FastifyReply) {
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

    const disappearingDuration = conversation.disappearingDuration || 0
    const cutoff =
      disappearingDuration > 0
        ? new Date(Date.now() - disappearingDuration * 1000)
        : null

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        NOT: {
          deletedBy: {
            has: userId,
          },
        },
        createdAt: cutoff ? { gte: cutoff } : undefined,
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true, showProfile: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return messages.map((m) => {
      if (m.sender.id !== userId && (m.sender as any).showProfile === false) {
        m.sender.image = null
      }
      return m
    })
  },

  async sendMessage(request: FastifyRequest, reply: FastifyReply) {
    const { id: conversationId } = request.params as any
    const { content, attachments } = request.body as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
    const userId = session.user.id

    const hasContent = content && content.trim()
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0
    if (!conversationId || (!hasContent && !hasAttachments)) {
      return reply
        .status(400)
        .send({ message: 'Message content or attachments required' })
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participantOne: { select: { id: true, name: true, lastActive: true } },
        participantTwo: { select: { id: true, name: true, lastActive: true } },
      },
    })

    if (!conversation) {
      return reply.status(404).send({ message: 'Conversation not found' })
    }

    if (
      conversation.participantOneId !== userId &&
      conversation.participantTwoId !== userId
    ) {
      return reply
        .status(403)
        .send({ message: 'Unauthorized in this conversation' })
    }

    if (conversation.blockedBy && conversation.blockedBy.length > 0) {
      return reply
        .status(400)
        .send({ message: 'Cannot send messages in a blocked conversation' })
    }

    const otherParticipant =
      conversation.participantOneId === userId
        ? conversation.participantTwo
        : conversation.participantOne
    const otherParticipantId = otherParticipant.id

    const isOtherOnline = isUserOnline(otherParticipant.lastActive)
    const deliveredAt = isOtherOnline ? new Date() : null

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: hasContent ? content.trim() : '',
        attachments: hasAttachments ? attachments : [],
        isRead: false,
        readAt: null,
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
    })

    const updatedConv = await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
      include: {
        participantOne: {
          select: {
            id: true,
            name: true,
            image: true,
            showProfile: true,
          },
        },
        participantTwo: {
          select: {
            id: true,
            name: true,
            image: true,
            showProfile: true,
          },
        },
      },
    })

    const payloadMessage = {
      ...message,
      sender: {
        ...message.sender,
        image:
          message.sender.showProfile === false ? null : message.sender.image,
      },
    }

    await broadcastToConversation(conversationId, 'new_message', payloadMessage)

    const sanitizedConv = {
      ...updatedConv,
      participantOne: {
        ...updatedConv.participantOne,
        image:
          (updatedConv.participantOne as any).showProfile === false
            ? null
            : updatedConv.participantOne.image,
      },
      participantTwo: {
        ...updatedConv.participantTwo,
        image:
          (updatedConv.participantTwo as any).showProfile === false
            ? null
            : updatedConv.participantTwo.image,
      },
    }

    await broadcastToUser(otherParticipantId, 'conversation_updated', {
      conversation: sanitizedConv,
      lastMessage: payloadMessage,
    })

    try {
      const senderName =
        (updatedConv.participantOneId === userId
          ? updatedConv.participantOne?.name
          : updatedConv.participantTwo?.name) || 'Someone'
      await createAndDeliverNotification({
        userId: otherParticipantId,
        title: `New message from ${senderName}`,
        message: message.content || 'Sent an attachment',
        type: 'chat',
        url: `/chat/${conversationId}`,
      })
    } catch (err) {
      console.error('Failed to send chat notification:', err)
    }

    return payloadMessage
  },

  async sendTyping(request: FastifyRequest, reply: FastifyReply) {
    const { id: conversationId } = request.params as any
    const { isTyping } = request.body as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) return reply.status(401).send({ message: 'Unauthorized' })
    const userId = session.user.id

    await broadcastToConversation(conversationId, 'typing', {
      conversationId,
      userId,
      isTyping: !!isTyping,
    })

    return { success: true }
  },

  async markRead(request: FastifyRequest, reply: FastifyReply) {
    const { id: conversationId } = request.params as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) return reply.status(401).send({ message: 'Unauthorized' })
    const userId = session.user.id

    const now = new Date()
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: now,
        deliveredAt: now,
      },
    })

    await broadcastToConversation(conversationId, 'messages_read', {
      conversationId,
      readAt: now.toISOString(),
    })

    return { success: true }
  },

  async editMessage(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const { content } = request.body as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
    const userId = session.user.id

    if (!content || !content.trim()) {
      return reply.status(400).send({ message: 'Content is required' })
    }

    const message = await prisma.message.findUnique({
      where: { id },
    })

    if (!message) {
      return reply.status(404).send({ message: 'Message not found' })
    }

    if (message.senderId !== userId) {
      return reply.status(403).send({ message: 'Forbidden' })
    }

    if (message.isDeleted) {
      return reply
        .status(400)
        .send({ message: 'Cannot edit a deleted message' })
    }

    const updated = await prisma.message.update({
      where: { id },
      data: {
        content: content.trim(),
        isEdited: true,
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true, showProfile: true },
        },
      },
    })

    const payload = {
      ...updated,
      sender: {
        ...updated.sender,
        image:
          updated.sender.showProfile === false ? null : updated.sender.image,
      },
    }

    await broadcastToConversation(
      updated.conversationId,
      'message_edited',
      payload,
    )

    return updated
  },

  async deleteMessage(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const { mode } = request.query as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
    const userId = session.user.id

    const message = await prisma.message.findUnique({
      where: { id },
    })

    if (!message) {
      return reply.status(404).send({ message: 'Message not found' })
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: message.conversationId },
    })
    if (
      !conversation ||
      (conversation.participantOneId !== userId &&
        conversation.participantTwoId !== userId)
    ) {
      return reply.status(403).send({ message: 'Forbidden' })
    }

    if (mode === 'everyone') {
      if (message.senderId !== userId && session.user.role !== 'admin') {
        return reply.status(403).send({
          message: 'Only the sender or an admin can delete for everyone',
        })
      }

      const fifteenMinutes = 15 * 60 * 1000
      const isWithinTimeLimit =
        Date.now() - new Date(message.createdAt).getTime() < fifteenMinutes
      if (!isWithinTimeLimit && session.user.role !== 'admin') {
        return reply.status(400).send({
          message: 'Time limit to delete this message has expired (15 minutes)',
        })
      }

      const updated = await prisma.message.update({
        where: { id },
        data: {
          isDeleted: true,
          content: 'This message was deleted',
          attachments: [],
        },
        include: {
          sender: {
            select: { id: true, name: true, image: true, showProfile: true },
          },
        },
      })

      const payload = {
        id: updated.id,
        conversationId: updated.conversationId,
        isDeleted: true,
        content: updated.content,
        attachments: updated.attachments,
        updatedAt: updated.updatedAt,
      }

      await broadcastToConversation(
        updated.conversationId,
        'message_deleted',
        payload,
      )

      return updated
    } else {
      const deletedBy = Array.from(new Set([...message.deletedBy, userId]))
      await prisma.message.update({
        where: { id },
        data: { deletedBy },
      })
      return { message: 'Message deleted for me' }
    }
  },

  async forwardMessage(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const { targetConversationIds } = request.body as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
    const userId = session.user.id

    if (
      !Array.isArray(targetConversationIds) ||
      targetConversationIds.length === 0
    ) {
      return reply
        .status(400)
        .send({ message: 'targetConversationIds must be a non-empty array' })
    }

    const message = await prisma.message.findUnique({
      where: { id },
    })

    if (!message) {
      return reply.status(404).send({ message: 'Message not found' })
    }

    const results = []

    for (const convId of targetConversationIds) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: convId },
        include: {
          participantOne: { select: { id: true, lastActive: true } },
          participantTwo: { select: { id: true, lastActive: true } },
        },
      })

      if (!conversation) continue
      if (
        conversation.participantOneId !== userId &&
        conversation.participantTwoId !== userId
      )
        continue

      const otherParticipant =
        conversation.participantOneId === userId
          ? conversation.participantTwo
          : conversation.participantOne
      const otherParticipantId = otherParticipant.id

      const isOtherOnline = isUserOnline(otherParticipant.lastActive)
      const deliveredAt = isOtherOnline ? new Date() : null

      let contentToForward = message.content
      if (contentToForward.startsWith('>>REPLY_TO::')) {
        const separator = '\u200B\u{1F4AC}\u200B'
        const sepIdx = contentToForward.indexOf(separator)
        if (sepIdx !== -1) {
          contentToForward = contentToForward.slice(sepIdx + separator.length)
        }
      }

      const forwarded = await prisma.message.create({
        data: {
          conversationId: convId,
          senderId: userId,
          content: contentToForward,
          attachments: message.attachments,
          isForwarded: true,
          isRead: false,
          readAt: null,
          deliveredAt,
        },
        include: {
          sender: {
            select: { id: true, name: true, image: true, showProfile: true },
          },
        },
      })

      const updatedConv = await prisma.conversation.update({
        where: { id: convId },
        data: { updatedAt: new Date() },
        include: {
          participantOne: {
            select: { id: true, name: true, image: true, showProfile: true },
          },
          participantTwo: {
            select: { id: true, name: true, image: true, showProfile: true },
          },
        },
      })

      const payloadMessage = {
        ...forwarded,
        sender: {
          ...forwarded.sender,
          image:
            forwarded.sender.showProfile === false
              ? null
              : forwarded.sender.image,
        },
      }

      await broadcastToConversation(convId, 'new_message', payloadMessage)

      const sanitizedConv = {
        ...updatedConv,
        participantOne: {
          ...updatedConv.participantOne,
          image:
            (updatedConv.participantOne as any).showProfile === false
              ? null
              : updatedConv.participantOne.image,
        },
        participantTwo: {
          ...updatedConv.participantTwo,
          image:
            (updatedConv.participantTwo as any).showProfile === false
              ? null
              : updatedConv.participantTwo.image,
        },
      }

      await broadcastToUser(otherParticipantId, 'conversation_updated', {
        conversation: sanitizedConv,
        lastMessage: payloadMessage,
      })

      results.push(forwarded)
    }

    return results
  },

  async toggleStarMessage(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) return reply.status(401).send({ message: 'Unauthorized' })
    const userId = session.user.id

    const message = await prisma.message.findUnique({ where: { id } })
    if (!message)
      return reply.status(404).send({ message: 'Message not found' })

    const starredBy = message.starredBy.includes(userId)
      ? message.starredBy.filter((uid) => uid !== userId)
      : [...message.starredBy, userId]

    const updated = await prisma.message.update({
      where: { id },
      data: { starredBy },
      include: {
        sender: {
          select: { id: true, name: true, image: true, showProfile: true },
        },
      },
    })

    await broadcastToConversation(
      updated.conversationId,
      'message_starred_updated',
      {
        id: updated.id,
        conversationId: updated.conversationId,
        starredBy: updated.starredBy,
      },
    )

    return updated
  },

  async togglePinMessage(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) return reply.status(401).send({ message: 'Unauthorized' })
    const userId = session.user.id

    const message = await prisma.message.findUnique({ where: { id } })
    if (!message)
      return reply.status(404).send({ message: 'Message not found' })

    const pinnedBy = message.pinnedBy.includes(userId)
      ? message.pinnedBy.filter((uid) => uid !== userId)
      : [...message.pinnedBy, userId]

    const updated = await prisma.message.update({
      where: { id },
      data: { pinnedBy },
      include: {
        sender: {
          select: { id: true, name: true, image: true, showProfile: true },
        },
      },
    })

    await broadcastToConversation(
      updated.conversationId,
      'message_pinned_updated',
      {
        id: updated.id,
        conversationId: updated.conversationId,
        pinnedBy: updated.pinnedBy,
      },
    )

    return updated
  },

  async addMessageReaction(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const { emoji } = request.body as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) return reply.status(401).send({ message: 'Unauthorized' })
    const userId = session.user.id
    const userName = session.user.name || 'User'

    if (!emoji) return reply.status(400).send({ message: 'Emoji is required' })

    const message = await prisma.message.findUnique({ where: { id } })
    if (!message)
      return reply.status(404).send({ message: 'Message not found' })

    let currentReactions = (message.reactions as any) || []
    if (!Array.isArray(currentReactions)) {
      currentReactions = []
    }

    currentReactions = currentReactions.filter((r: any) => r.userId !== userId)
    currentReactions.push({ userId, name: userName, emoji })

    const updated = await prisma.message.update({
      where: { id },
      data: { reactions: currentReactions },
      include: {
        sender: {
          select: { id: true, name: true, image: true, showProfile: true },
        },
      },
    })

    await broadcastToConversation(
      updated.conversationId,
      'message_reactions_updated',
      {
        id: updated.id,
        conversationId: updated.conversationId,
        reactions: updated.reactions,
      },
    )

    return updated
  },

  async removeMessageReaction(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) return reply.status(401).send({ message: 'Unauthorized' })
    const userId = session.user.id

    const message = await prisma.message.findUnique({ where: { id } })
    if (!message)
      return reply.status(404).send({ message: 'Message not found' })

    let currentReactions = (message.reactions as any) || []
    if (!Array.isArray(currentReactions)) {
      currentReactions = []
    }

    currentReactions = currentReactions.filter((r: any) => r.userId !== userId)

    const updated = await prisma.message.update({
      where: { id },
      data: { reactions: currentReactions },
      include: {
        sender: {
          select: { id: true, name: true, image: true, showProfile: true },
        },
      },
    })

    await broadcastToConversation(
      updated.conversationId,
      'message_reactions_updated',
      {
        id: updated.id,
        conversationId: updated.conversationId,
        reactions: updated.reactions,
      },
    )

    return updated
  },
}
