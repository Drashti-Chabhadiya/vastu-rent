import { FastifyInstance } from 'fastify'
import { statsController } from './stats.controller.js'
import { auth } from '../../config/auth.js'

export async function statsRoutes(fastify: FastifyInstance) {
  const requireAdmin = async (request: any, reply: any) => {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session || session.user.role !== 'admin') {
      return reply
        .status(403)
        .send({ message: 'Forbidden: Admin access required' })
    }
  }

  fastify.get(
    '/',
    { preHandler: [requireAdmin] },
    statsController.getDashboardStats,
  )
  fastify.get(
    '/bookings-over-time',
    { preHandler: [requireAdmin] },
    statsController.getBookingsOverTime,
  )
  fastify.get(
    '/revenue-over-time',
    { preHandler: [requireAdmin] },
    statsController.getRevenueOverTime,
  )
  fastify.get('/top-cities', statsController.getTopCities) // Open to all
  fastify.get(
    '/recent-reviews',
    { preHandler: [requireAdmin] },
    statsController.getRecentReviews,
  )
}
