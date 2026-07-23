import { FastifyInstance } from 'fastify'
import { userController } from './user.controller.js'
import { auth } from '../../config/auth.js'
import { isAdminRole } from '../../config/roles.js'

export async function userRoutes(fastify: FastifyInstance) {
  // Public Profile Route
  fastify.get('/profile/:id', userController.getPublicProfile)

  // User Settings Route
  fastify.patch('/settings', userController.updateSettings)

  // User Sessions Routes
  fastify.get('/settings/sessions', userController.getSessions)
  fastify.patch('/settings/sessions/:id', userController.renameSession)
  fastify.delete('/settings/sessions/:id', userController.revokeSession)

  // User Recent Searches Routes
  fastify.get('/settings/recent-searches', userController.getRecentSearches)
  fastify.post('/settings/recent-searches', userController.saveRecentSearch)
  fastify.delete(
    '/settings/recent-searches/:id',
    userController.deleteRecentSearch,
  )
  fastify.delete(
    '/settings/recent-searches',
    userController.clearRecentSearches,
  )

  // Cloudinary Settings Routes
  fastify.get('/settings/cloudinary', userController.getCloudinaryConfig)
  fastify.post('/settings/cloudinary', userController.saveCloudinaryConfig)
  fastify.post('/settings/cloudinary/test', userController.testCloudinaryConfig)
  fastify.get('/settings/cloudinary/usage', userController.getCloudinaryUsage)

  // Admin Routes (Encapsulated to prevent hook pollution on settings and profile routes)
  fastify.register(async (adminScope) => {
    adminScope.addHook('preHandler', async (request, reply) => {
      const session = await auth.api.getSession({
        headers: request.headers as any,
      })
      if (!session || !isAdminRole(session.user.role)) {
        return reply
          .status(403)
          .send({ message: 'Forbidden: Admin access required' })
      }
    })

    adminScope.get('/', userController.getAllUsers)
    adminScope.get('/recent', userController.getRecentUsers)
    adminScope.post('/:id/ban', userController.banUser)
    adminScope.post('/:id/role', userController.updateUserRole)
    adminScope.delete('/:id', userController.deleteUser)
  })
}
