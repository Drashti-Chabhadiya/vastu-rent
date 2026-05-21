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
      await rentalService.updateRentalStatus(rentalId, "confirmed", "paid", razorpay_payment_id);
      
      return { success: true, message: "Payment verified successfully" };
    } else {
      return reply.status(400).send({ success: false, message: "Invalid payment signature" });
    }
  }
}

export const paymentController = new PaymentController();
