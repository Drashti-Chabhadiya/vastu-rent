import { FastifyRequest, FastifyReply } from "fastify";
import { paymentService } from "./payment.service.js";
import { rentalService } from "../rental/rental.service.js";

export class PaymentController {
  /**
   * Confirm payment for an online rental.
   * Generates an internal reference and marks the rental as confirmed + paid.
   */
  async confirmPayment(request: FastifyRequest, reply: FastifyReply) {
    const { rentalId } = request.body as { rentalId: string };
    const userId = (request as any).user.id;

    // Verify the rental belongs to the requesting user
    const rentals = await rentalService.getMyRentals(userId);
    const rental = rentals.find((r: any) => r.id === rentalId);

    if (!rental) {
      return reply.status(404).send({ message: "Rental not found" });
    }

    if (rental.paymentStatus === "paid") {
      return reply.status(400).send({ message: "Payment already confirmed" });
    }

    try {
      const transactionId = paymentService.generatePaymentReference(rentalId);

      // Mark rental as confirmed and paid
      const updatedRental = await rentalService.updateRentalStatus(
        rentalId,
        "confirmed",
        "paid",
        transactionId
      );

      // Send notifications in background
      try {
        const { createAndDeliverNotification } = await import('../../lib/notification.js');

        await createAndDeliverNotification({
          userId: updatedRental.renterId,
          title: "Payment Confirmed! 💳",
          message: `Your payment of ₹${updatedRental.totalPrice} for "${updatedRental.product.title}" was confirmed.`,
          type: "payment",
          url: `/account/bookings`,
        });

        await createAndDeliverNotification({
          userId: updatedRental.product.userId,
          title: "Payment Received! 💰",
          message: `Payment of ₹${updatedRental.totalPrice} for your product "${updatedRental.product.title}" has been received.`,
          type: "payment",
          url: `/dashboard/orders`,
        });
      } catch (err) {
        console.error("Failed to deliver payment notifications:", err);
      }

      return { success: true, rental: updatedRental, transactionId };
    } catch (error: any) {
      return reply.status(500).send({ message: error.message });
    }
  }

  /**
   * Create a Stripe Checkout Session (or simulated fallback session) for online booking payment.
   */
  async createBookingSession(request: FastifyRequest, reply: FastifyReply) {
    const { rentalId } = request.body as { rentalId: string };
    const userId = (request as any).user.id;

    if (!rentalId) {
      return reply.status(400).send({ message: "Rental ID is required" });
    }

    try {
      const session = await paymentService.createBookingSession(userId, rentalId);
      return session;
    } catch (error: any) {
      return reply.status(500).send({ message: error.message });
    }
  }

  /**
   * Verify a Stripe Checkout Session (or simulated fallback session) for online booking payment.
   */
  async verifyBookingSession(request: FastifyRequest, reply: FastifyReply) {
    const { sessionId, rentalId } = request.body as { sessionId: string; rentalId: string };
    const userId = (request as any).user.id;

    if (!sessionId || !rentalId) {
      return reply.status(400).send({ message: "Session ID and Rental ID are required" });
    }

    try {
      const result = await paymentService.verifyBookingSession(userId, sessionId, rentalId);
      return result;
    } catch (error: any) {
      return reply.status(500).send({ message: error.message });
    }
  }
}

export const paymentController = new PaymentController();
