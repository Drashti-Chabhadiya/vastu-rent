import { FastifyInstance } from 'fastify'
import { addressController } from './address.controller.js'
import { auth } from '../../config/auth.js'

export async function addressRoutes(fastify: FastifyInstance) {
  const authHandler = async (request: any, reply: any) => {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) return reply.status(401).send({ message: 'Unauthorized' })
    request.user = session.user
  }

  // All address routes require authentication
  fastify.get(
    '/',
    { preHandler: [authHandler] },
    addressController.getUserAddresses,
  )

  fastify.get(
    '/:id',
    { preHandler: [authHandler] },
    addressController.getAddressById,
  )

  fastify.post(
    '/',
    { preHandler: [authHandler] },
    addressController.createAddress,
  )

  fastify.put(
    '/:id',
    { preHandler: [authHandler] },
    addressController.updateAddress,
  )

  fastify.delete(
    '/:id',
    { preHandler: [authHandler] },
    addressController.deleteAddress,
  )

  fastify.patch(
    '/:id/default',
    { preHandler: [authHandler] },
    addressController.setDefaultAddress,
  )
}
