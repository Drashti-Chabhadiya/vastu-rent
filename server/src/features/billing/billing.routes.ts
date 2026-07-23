import { FastifyInstance } from 'fastify'
import { billingController } from './billing.controller.js'
import { auth } from '../../config/auth.js'

export async function billingRoutes(fastify: FastifyInstance) {
  const authHandler = async (request: any, reply: any) => {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) return reply.status(401).send({ message: 'Unauthorized' })
    request.user = session.user
  }

  fastify.post(
    '/create-checkout-session',
    { preHandler: [authHandler] },
    billingController.createCheckoutSession,
  )
  fastify.post(
    '/verify-session',
    { preHandler: [authHandler] },
    billingController.verifyCheckoutSession,
  )
}
