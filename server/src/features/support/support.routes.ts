import type { FastifyInstance } from 'fastify'
import { SupportController } from './support.controller.js'

export async function supportRoutes(fastify: FastifyInstance) {
  // Public route to submit a contact inquiry
  fastify.post(
    '/contact',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    SupportController.submitContactInquiry,
  )

  // Public route to subscribe to the email newsletter
  fastify.post(
    '/newsletter/subscribe',
    SupportController.submitNewsletterSubscription,
  )
}
