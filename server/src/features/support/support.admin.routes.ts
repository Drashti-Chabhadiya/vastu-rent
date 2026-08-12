import { FastifyInstance } from 'fastify'
import { SupportAdminController } from './support.admin.controller.js'
import { auth } from '../../config/auth.js'
import { isAdminRole } from '../../config/roles.js'

export async function supportAdminRoutes(fastify: FastifyInstance) {
  // Protect all routes with admin middleware
  fastify.addHook('preHandler', async (request, reply) => {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session || !isAdminRole(session.user.role)) {
      return reply
        .status(403)
        .send({ message: 'Forbidden: Admin access required' })
    }
  })

  fastify.get('/', SupportAdminController.getInquiries)
  fastify.patch('/:id/read', SupportAdminController.markAsRead)
  fastify.delete('/:id', SupportAdminController.deleteInquiry)
}
