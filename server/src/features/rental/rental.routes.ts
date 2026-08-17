import { FastifyInstance } from 'fastify'
import { rentalController } from './rental.controller.js'
import { auth } from '../../config/auth.js'

export async function rentalRoutes(fastify: FastifyInstance) {
  // Public Routes
  fastify.get('/product/:productId', rentalController.getProductRentals)

  // Protected Routes (Session check)
  fastify.register(async (protectedFastify) => {
    protectedFastify.addHook('preHandler', async (request, reply) => {
      const session = await auth.api.getSession({
        headers: request.headers as any,
      })
      if (!session) return reply.status(401).send({ message: 'Unauthorized' })
      ;(request as any).user = session.user
    })

    protectedFastify.post('/', rentalController.createRental)
    protectedFastify.get('/my', rentalController.getMyRentals)
    protectedFastify.get('/orders', rentalController.getOrders)
    protectedFastify.get('/all', rentalController.getAllRentals)
    protectedFastify.patch('/:id/status', rentalController.updateStatus)
    protectedFastify.patch(
      '/:id/verify-pickup',
      { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } },
      rentalController.verifyPickupOTP,
    )
    protectedFastify.patch(
      '/:id/verify-return',
      { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } },
      rentalController.verifyReturnOTP,
    )
  })
}
