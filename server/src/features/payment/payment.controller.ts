import { FastifyRequest, FastifyReply } from "fastify";
import { paymentService } from "./payment.service.js";
import { rentalService } from "../rental/rental.service.js";

export class PaymentController {
  async createOrder(request: FastifyRequest, reply: FastifyReply) {
    const { rentalId } = request.body as { rentalId: string };
    
    // Fetch rental details
    const rentals = await rentalService.getMyRentals((request as any).user.id);
    const rental = rentals.find((r: any) => r.id === rentalId);

    if (!rental) {
      return reply.status(404).send({ message: "Rental not found" });
    }

    try {
      const order = await paymentService.createOrder(rental.totalPrice, `receipt_${rental.id}`);
      return { order };
    } catch (error: any) {
      return reply.status(500).send({ message: error.message });
    }
  }

  async verifyPayment(request: FastifyRequest, reply: FastifyReply) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, rentalId } = request.body as any;

    const isValid = paymentService.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (isValid) {
      // Update rental status and payment status
      const rental = await rentalService.updateRentalStatus(rentalId, "confirmed", "paid", razorpay_payment_id);
      
      // Send payment notifications in background
      try {
        const { createAndDeliverNotification } = await import('../../lib/notification.js');
        
        // 1. Notify Renter
        await createAndDeliverNotification({
          userId: rental.renterId,
          title: "Payment Successful! 💳",
          message: `Your payment of ₹${rental.totalPrice} for "${rental.product.title}" was successful.`,
          type: "payment",
          url: `/journal`,
        });

        // 2. Notify Product Owner
        await createAndDeliverNotification({
          userId: rental.product.ownerId,
          title: "Payment Received! 💰",
          message: `Payment of ₹${rental.totalPrice} for your product "${rental.product.title}" has been received.`,
          type: "payment",
          url: `/journal`,
        });
      } catch (err) {
        console.error("Failed to deliver payment verification notifications:", err);
      }

      return { success: true, message: "Payment verified successfully" };
    } else {
      return reply.status(400).send({ success: false, message: "Invalid payment signature" });
    }
  }
}

export const paymentController = new PaymentController();
