import { FastifyInstance } from "fastify";
import { payoutController } from "./payout.controller.js";
import { auth } from "../../config/auth.js";

export async function payoutRoutes(fastify: FastifyInstance) {
  // Add authentication validation middleware hook to check active user sessions
  fastify.addHook("preHandler", async (request, reply) => {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });
    (request as any).user = session.user;
  });

  // User Routes
  fastify.get("/dashboard", payoutController.getEarningsDashboard);
  fastify.post("/request", payoutController.createPayoutRequest);

  // Admin Routes
  fastify.get("/requests", payoutController.getAllPayoutRequests);
  fastify.patch("/:id/status", payoutController.updatePayoutStatus);
}
