import { FastifyInstance } from "fastify";
import { paymentController } from "./payment.controller.js";
import { auth } from "../../config/auth.js";

export async function paymentRoutes(fastify: FastifyInstance) {
  const authHandler = async (request: any, reply: any) => {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });
    request.user = session.user;
  };

  fastify.post("/confirm-payment", { preHandler: [authHandler] }, paymentController.confirmPayment);
  fastify.post("/create-booking-session", { preHandler: [authHandler] }, paymentController.createBookingSession);
  fastify.post("/verify-booking-session", { preHandler: [authHandler] }, paymentController.verifyBookingSession);
  fastify.post("/cancel-booking-session", { preHandler: [authHandler] }, paymentController.cancelBookingSession);
}
