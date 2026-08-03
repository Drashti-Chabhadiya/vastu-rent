import { FastifyInstance } from 'fastify'
import { notificationController } from './notification.controller.js'
import { auth } from '../../config/auth.js'
import { deviceRoutes } from './device.routes.js'

export async function notificationRoutes(fastify: FastifyInstance) {
  const authHandler = async (request: any, reply: any) => {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
  }

  fastify.get('/', { preHandler: [authHandler] }, notificationController.getNotifications)
  fastify.put('/:id/read', { preHandler: [authHandler] }, notificationController.markAsRead)
  fastify.put('/read-all', { preHandler: [authHandler] }, notificationController.markAllAsRead)
  fastify.post('/announcement', { preHandler: [authHandler] }, notificationController.sendAnnouncement)

  // Device token management for push notifications (some routes allow guests)
  fastify.register(deviceRoutes, { prefix: '/device' })
}
