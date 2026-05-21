import Razorpay from "razorpay";
import crypto from "crypto";

export class PaymentService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
    });
  }

  async createOrder(amount: number, receipt: string) {
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: receipt,
    };

    try {
      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error("Razorpay Order Creation Error:", error);
      throw new Error("Failed to create payment order");
    }
  }

  verifyPayment(orderId: string, paymentId: string, signature: string) {
    const text = orderId + "|" + paymentId;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret")
      .update(text)
      .digest("hex");

    return generated_signature === signature;
  }
}

export const paymentService = new PaymentService();
