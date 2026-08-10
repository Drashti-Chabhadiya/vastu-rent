import { FastifyInstance } from 'fastify'
import { prisma } from '../../config/prisma.js'

export async function cronRoutes(app: FastifyInstance) {
  app.get('/cleanup-unverified-users', async (request, reply) => {
    // 1. Verify Vercel Cron Secret or simple authorization header
    const authHeader = request.headers.authorization
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    try {
      // 2. Find and delete users who are NOT verified AND were created more than 24 hours ago
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

      const result = await prisma.user.deleteMany({
        where: {
          emailVerified: false,
          createdAt: {
            lt: twentyFourHoursAgo,
          },
        },
      })

      return reply.send({
        success: true,
        message: `Cleanup completed. Deleted ${result.count} unverified users.`,
        deletedCount: result.count,
      })
    } catch (error) {
      request.log.error(error)
      return reply
        .status(500)
        .send({ error: 'Internal Server Error during cleanup' })
    }
  })
}
