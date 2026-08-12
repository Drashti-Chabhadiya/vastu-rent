import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../../config/prisma.js'
import {
  sendContactSupportEmail,
  sendMarketingWelcomeEmail,
} from '../../lib/mail.js'

export const SupportController = {
  async submitContactInquiry(
    request: FastifyRequest<{
      Body: { name: string; email: string; subject: string; message: string }
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { name, email, subject, message } = request.body

      if (!name || !email || !subject || !message) {
        return reply.code(400).send({
          success: false,
          message: 'All fields are required (name, email, subject, message).',
        })
      }

      // Save to database
      await prisma.contactInquiry.create({
        data: {
          name,
          email,
          subject,
          message,
        },
      })

      // Trigger asynchronous support email dispatch
      await sendContactSupportEmail({ name, email, subject, message })

      return {
        success: true,
        message:
          'Your message has been sent successfully to the Vastu Support team.',
      }
    } catch (error: any) {
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        message: error.message || 'Failed to process support inquiry.',
      })
    }
  },

  async submitNewsletterSubscription(
    request: FastifyRequest<{ Body: { email: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { email } = request.body

      if (!email) {
        return reply.code(400).send({
          success: false,
          message: 'Email address is required.',
        })
      }

      // Simple email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return reply.code(400).send({
          success: false,
          message: 'Please enter a valid email address.',
        })
      }

      // Send simulated welcome/deal code email
      await sendMarketingWelcomeEmail({
        email,
        name: email.split('@')[0], // Extract pre-@ portion as fallback user name
      })

      return {
        success: true,
        message: 'Thank you for subscribing to stay in the loop!',
      }
    } catch (error: any) {
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        message: error.message || 'Failed to complete newsletter subscription.',
      })
    }
  },
}
