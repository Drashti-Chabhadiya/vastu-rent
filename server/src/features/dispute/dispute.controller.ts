import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../../config/prisma.js'
import { auth } from '../../config/auth.js'
import { createAndDeliverNotification } from '../../lib/notification.js'

export class DisputeController {
  async getAllDisputes(_request: FastifyRequest, _reply: FastifyReply) {
    const disputes = await prisma.dispute.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        rental: {
          include: {
            product: {
              select: { id: true, title: true, price: true },
            },
            renter: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        reportedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return { disputes }
  }

  async createDispute(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    if (!session) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { rentalId, reason, description } = request.body as any

    if (!rentalId || !reason || !description) {
      return reply
        .status(400)
        .send({ message: 'Rental ID, reason, and description are required' })
    }

    const dispute = await prisma.dispute.create({
      data: {
        rentalId,
        reportedById: session.user.id,
        reason,
        description,
        status: 'open',
      },
    })

    // Notify admins of a new dispute
    try {
      await createAndDeliverNotification({
        userId: session.user.id,
        title: 'Dispute Opened',
        message: `Dispute opened for rental ${rentalId}. Reason: ${reason}`,
        type: 'alert',
      })
    } catch (err) {
      console.error('Failed to deliver dispute notification:', err)
    }

    return { dispute }
  }

  async resolveDispute(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const { status, resolution } = request.body as any

    if (!['resolved', 'dismissed'].includes(status)) {
      return reply
        .status(400)
        .send({ message: 'Invalid status: Must be resolved or dismissed' })
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: { rental: true },
    })

    if (!dispute) {
      return reply.status(404).send({ message: 'Dispute not found' })
    }

    const updated = await prisma.dispute.update({
      where: { id },
      data: {
        status,
        resolution,
      },
    })

    // Notify the reported user & the renter
    try {
      await createAndDeliverNotification({
        userId: dispute.reportedById,
        title: 'Dispute Resolution',
        message: `Your dispute for rental ${dispute.rentalId} has been ${status}. Resolution: ${resolution || 'No comments.'}`,
        type: 'info',
      })
    } catch (err) {
      console.error('Failed to deliver dispute resolution notification:', err)
    }

    return { success: true, dispute: updated }
  }
}

export const disputeController = new DisputeController()
