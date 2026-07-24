import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../../config/prisma.js'
import { auth } from '../../config/auth.js'
import { createAndDeliverNotification } from '../../lib/notification.js'

export class NotificationController {
  async getNotifications(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return { notifications }
  }

  async markAsRead(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const updated = await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { isRead: true },
    })

    return { success: true, count: updated.count }
  }

  async markAllAsRead(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const updated = await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    })

    return { success: true, count: updated.count }
  }

  async sendAnnouncement(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) return reply.status(401).send({ message: 'Unauthorized' })

    // Restrict access to admin
    if (session.user.role !== 'admin') {
      return reply
        .status(403)
        .send({ message: 'Forbidden: Admin access required' })
    }

    const { title, message } = request.body as {
      title: string
      message: string
    }
    if (!title || !message) {
      return reply
        .status(400)
        .send({ message: 'Title and message are required' })
    }

    try {
      // Find all users in the system
      const users = await prisma.user.findMany({ select: { id: true } })

      // Create and deliver notifications to everyone in parallel
      await Promise.all(
        users.map((u) =>
          createAndDeliverNotification({
            userId: u.id,
            title,
            message,
            type: 'alert',
          }).catch((e) =>
            console.error(`Announcement error for user ${u.id}:`, e),
          ),
        ),
      )

      return { success: true, count: users.length }
    } catch (err) {
      console.error('Announcement failed:', err)
      return reply
        .status(500)
        .send({ message: 'Failed to broadcast announcement' })
    }
  }
}

export const notificationController = new NotificationController()
