import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../../config/prisma.js'

export const SupportAdminController = {
  async getInquiries(request: FastifyRequest, reply: FastifyReply) {
    try {
      const inquiries = await prisma.contactInquiry.findMany({
        orderBy: { createdAt: 'desc' },
      })
      return { success: true, inquiries }
    } catch (error: any) {
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        message: error.message || 'Failed to fetch inquiries.',
      })
    }
  },

  async markAsRead(
    request: FastifyRequest<{
      Params: { id: string }
      Body: { isRead: boolean }
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params
      const { isRead } = request.body

      const inquiry = await prisma.contactInquiry.update({
        where: { id },
        data: { isRead },
      })
      return { success: true, inquiry }
    } catch (error: any) {
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        message: error.message || 'Failed to update inquiry.',
      })
    }
  },

  async deleteInquiry(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params
      await prisma.contactInquiry.delete({
        where: { id },
      })
      return { success: true }
    } catch (error: any) {
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        message: error.message || 'Failed to delete inquiry.',
      })
    }
  },
}
