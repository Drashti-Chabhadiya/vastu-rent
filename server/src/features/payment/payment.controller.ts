import { FastifyRequest, FastifyReply } from 'fastify'
import { paymentService } from './payment.service.js'
import { rentalService } from '../rental/rental.service.js'
import { paymentQueue } from '../../queues/queues.js'
import { JOB_NAMES } from '../../constants/queue-keys.js'

export class PaymentController {
  /**
   * Confirm payment for an online rental.
   * Generates an internal reference and marks the rental as confirmed + paid.
   */
  async confirmPayment(request: FastifyRequest, reply: FastifyReply) {
    const { rentalId } = request.body as { rentalId: string }
    const userId = (request as any).user.id

    // Verify the rental belongs to the requesting user
    const rentals = await rentalService.getMyRentals(userId)
    const rental = rentals.find((r: any) => r.id === rentalId)

    if (!rental) {
      return reply.status(404).send({ message: 'Rental not found' })
    }

    if (rental.paymentStatus === 'paid') {
      return reply.status(400).send({ message: 'Payment already confirmed' })
    }

    try {
      const transactionId = paymentService.generatePaymentReference(rentalId)

      // Mark rental as confirmed and paid
      const updatedRental = await rentalService.updateRentalStatus(
        rentalId,
        'confirmed',
        'paid',
        transactionId,
      )

      // Offload notification dispatch & invoice generation to background queue
      try {
        await paymentQueue.add(JOB_NAMES.PAYMENT.GENERATE_INVOICE, { rentalId })
      } catch (err) {
        console.error('Failed to queue invoice generation:', err)
      }

      return { success: true, rental: updatedRental, transactionId }
    } catch (error: any) {
      return reply.status(500).send({ message: error.message })
    }
  }

  /**
   * Create a Stripe Checkout Session (or simulated fallback session) for online booking payment.
   */
  async createBookingSession(request: FastifyRequest, reply: FastifyReply) {
    const { rentalId } = request.body as { rentalId: string }
    const userId = (request as any).user.id

    if (!rentalId) {
      return reply.status(400).send({ message: 'Rental ID is required' })
    }

    try {
      const session = await paymentService.createBookingSession(
        userId,
        rentalId,
      )
      return session
    } catch (error: any) {
      return reply.status(500).send({ message: error.message })
    }
  }

  /**
   * Verify a Stripe Checkout Session (or simulated fallback session) for online booking payment.
   */
  async verifyBookingSession(request: FastifyRequest, reply: FastifyReply) {
    const { sessionId, rentalId } = request.body as {
      sessionId: string
      rentalId: string
    }
    const userId = (request as any).user.id

    if (!sessionId || !rentalId) {
      return reply
        .status(400)
        .send({ message: 'Session ID and Rental ID are required' })
    }

    try {
      await paymentQueue.add(JOB_NAMES.PAYMENT.VERIFY_PAYMENT, {
        userId,
        sessionId,
        rentalId,
      })

      return {
        success: true,
        message: 'Payment verification has been queued in the background.',
      }
    } catch (error: any) {
      return reply.status(500).send({ message: error.message })
    }
  }

  /**
   * Cancel a Stripe checkout session or a simulated mock checkout session.
   * Runs an ACID transaction to update status to cancelled and rollback coupon.
   */
  async cancelBookingSession(request: FastifyRequest, reply: FastifyReply) {
    const { rentalId } = request.body as { rentalId: string }
    const userId = (request as any).user.id

    if (!rentalId) {
      return reply.status(400).send({ message: 'Rental ID is required' })
    }

    try {
      const result = await paymentService.cancelBookingSession(userId, rentalId)
      return result
    } catch (error: any) {
      return reply.status(500).send({ message: error.message })
    }
  }
}

export const paymentController = new PaymentController()
