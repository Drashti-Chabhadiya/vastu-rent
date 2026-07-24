import { FastifyInstance } from 'fastify'
import { settingsController } from './settings.controller.js'
import { auth } from '../../config/auth.js'

export async function settingsRoutes(fastify: FastifyInstance) {
  // Public route to fetch settings
  fastify.get('/', settingsController.getSettings)

  // Admin protected route to update settings
  fastify.post('/update', async (request, reply) => {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session || session.user.role !== 'admin') {
      return reply
        .status(403)
        .send({ message: 'Forbidden: Admin access required' })
    }
    return settingsController.updateSettings(request as any, reply)
  })
}
