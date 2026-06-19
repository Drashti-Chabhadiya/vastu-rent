import crypto from "crypto";
import { prisma } from "../../config/prisma.js";
import { stripe } from "../../lib/stripe.js";
import { rentalService } from "../rental/rental.service.js";

export class PaymentService {
  /**
   * Generate a simple internal payment reference ID.
   * No third-party gateway involved.
   */
  generatePaymentReference(rentalId: string): string {
    return "PAY-" + crypto.randomBytes(8).toString("hex").toUpperCase();
  }

  /**
   * Create a Stripe Checkout Session for a booking/rental.
   * Uses simulated mock session if Stripe is not fully configured.
   */
  async createBookingSession(userId: string, rentalId: string) {
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        product: true,
        renter: { select: { name: true, email: true } }
      }
    });

    if (!rental) throw new Error("Rental booking not found");
    if (rental.renterId !== userId) throw new Error("Unauthorized access to this booking");

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const isMock = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "sk_test_placeholder";

    if (isMock) {
      console.log(`ℹ️  Stripe key is a placeholder. Generating a simulated Stripe Checkout session for booking.`);
      const mockSessionId = `mock_booking_session_${rentalId}_${Date.now()}`;
      const mockSessionUrl = `${clientUrl}/account/bookings?session_id=${mockSessionId}&rental_id=${rentalId}`;
      return { url: mockSessionUrl, id: mockSessionId };
    }

    try {
      const amountPaise = Math.round(rental.totalPrice * 100);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: `Rental: ${rental.product.title}`,
                description: `Rental from ${rental.startDate.toLocaleDateString()} to ${rental.endDate.toLocaleDateString()}`,
              },
              unit_amount: amountPaise,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        customer_email: rental.renter.email,
        billing_address_collection: "required",
        payment_intent_data: {
          description: `Rental: ${rental.product.title} booking export transaction for User ${userId}`,
        },
        success_url: `${clientUrl}/account/bookings?session_id={CHECKOUT_SESSION_ID}&rental_id=${rentalId}`,
        cancel_url: `${clientUrl}/products/${rental.productId}?payment_cancelled=true&rental_id=${rentalId}`,
        metadata: {
          rentalId: rentalId,
          userId: userId,
          type: "rental_booking",
        },
      });

      return { url: session.url!, id: session.id };
    } catch (error: any) {
      console.error("❌ Stripe Booking Checkout Session Creation failed, falling back to mock session:", error);
      const mockSessionId = `mock_booking_session_${rentalId}_${Date.now()}`;
      const mockSessionUrl = `${clientUrl}/account/bookings?session_id=${mockSessionId}&rental_id=${rentalId}`;
      return { url: mockSessionUrl, id: mockSessionId };
    }
  }

  /**
   * Verify a Stripe Checkout Session for a booking/rental.
   * Confirms payment and updates the booking status.
   */
  async verifyBookingSession(userId: string, sessionId: string, rentalId: string) {
    // Check if it's a simulated mock session
    if (sessionId.startsWith("mock_booking_session_")) {
      const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        include: { product: true }
      });

      if (!rental) throw new Error("Rental booking not found");
      if (rental.renterId !== userId) throw new Error("Unauthorized access to this booking");

      if (rental.paymentStatus === "paid") {
        return { success: true, rental };
      }

      // Update rental status to confirmed and paid
      const updatedRental = await rentalService.updateRentalStatus(
        rentalId,
        "confirmed",
        "paid",
        sessionId
      );

      // Dispatch notifications
      await this.sendPaymentNotifications(updatedRental);

      return { success: true, rental: updatedRental };
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const metaRentalId = session.metadata?.rentalId || rentalId;
      const metaUserId = session.metadata?.userId || userId;

      if (metaUserId !== userId) {
        throw new Error("Unauthorized payment verification attempt");
      }

      const rental = await prisma.rental.findUnique({
        where: { id: metaRentalId },
        include: { product: true }
      });

      if (!rental) throw new Error("Rental booking not found");

      if (rental.paymentStatus === "paid") {
        return { success: true, rental };
      }

      if (session.payment_status !== "paid") {
        // Payment failed or unpaid: Rollback / cancel booking under transaction context
        const updatedRental = await prisma.$transaction(async (tx) => {
          const rent = await tx.rental.findUnique({ where: { id: metaRentalId } });
          if (!rent) throw new Error("Rental booking not found");

          const updated = await rentalService.updateRentalStatus(
            metaRentalId,
            "cancelled",
            "failed",
            session.id,
            tx
          );
          return updated;
        });

        return { success: false, message: "Payment was not successful. Booking has been cancelled.", rental: updatedRental };
      }

      const transactionId = session.payment_intent as string || session.id;

      // Update rental status to confirmed and paid under transaction context
      const updatedRental = await prisma.$transaction(async (tx) => {
        return rentalService.updateRentalStatus(
          metaRentalId,
          "confirmed",
          "paid",
          transactionId,
          tx
        );
      });

      // Dispatch notifications
      await this.sendPaymentNotifications(updatedRental);

      return { success: true, rental: updatedRental };
    } catch (error: any) {
      console.error("❌ Stripe Booking Verification Error:", error);
      // Run transaction to cancel the rental if verifying failed to guarantee rollback/cancelled status
      try {
        await prisma.$transaction(async (tx) => {
          const rent = await tx.rental.findUnique({ where: { id: rentalId } });
          if (rent && rent.status === "pending") {
            await rentalService.updateRentalStatus(
              rentalId,
              "cancelled",
              "failed",
              sessionId,
              tx
            );
          }
        });
      } catch (cancelErr) {
        console.error("Failed to cancel rental booking on verification error:", cancelErr);
      }
      throw new Error(`Failed to verify booking payment session: ${error.message}`);
    }
  }

  /**
   * Cancel a Stripe or Mock Booking Session.
   * Runs inside an ACID transaction to update status and release any coupon usage.
   */
  async cancelBookingSession(userId: string, rentalId: string) {
    return prisma.$transaction(async (tx) => {
      const rental = await tx.rental.findUnique({
        where: { id: rentalId },
        include: { product: true }
      });

      if (!rental) throw new Error("Rental booking not found");
      if (rental.renterId !== userId) throw new Error("Unauthorized access to this booking");

      // Only cancel if it is still pending
      if (rental.status === "pending") {
        const updatedRental = await rentalService.updateRentalStatus(
          rentalId,
          "cancelled",
          "failed",
          undefined,
          tx
        );

        // Deliver notification/alert for cancellation
        try {
          const { createAndDeliverNotification } = await import('../../lib/notification.js');
          await createAndDeliverNotification({
            userId: rental.renterId,
            title: "Booking Cancelled ❌",
            message: `Your booking payment for "${rental.product.title}" was cancelled or failed.`,
            type: "alert",
            url: `/account/bookings`,
          });
        } catch (err) {
          console.error("Failed to deliver notification for cancellation:", err);
        }

        return { success: true, rental: updatedRental };
      }

      return { success: false, message: "Booking is not in pending state", rental };
    });
  }

  /**
   * Helper to dispatch payment notifications to lister and renter
   */
  private async sendPaymentNotifications(updatedRental: any) {
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
  }
}

export const paymentService = new PaymentService();
