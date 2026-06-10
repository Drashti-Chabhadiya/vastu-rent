import { FastifyInstance } from "fastify";
import { reviewController } from "./review.controller.js";
import { auth } from "../../config/auth.js";

export async function reviewRoutes(fastify: FastifyInstance) {
  // Public Routes
  fastify.get("/", reviewController.getAllReviews);

  // Protected Routes
  fastify.post("/", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session) return reply.status(401).send({ message: "Unauthorized" });
      (request as any).user = session.user;
    }
  }, reviewController.createReview);

  fastify.post("/:id/reply", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session) return reply.status(401).send({ message: "Unauthorized" });
      (request as any).user = session.user;
    }
  }, reviewController.replyToReview);

  // Admin Only
  fastify.delete("/:id", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session || session.user.role !== "admin") {
        return reply.status(403).send({ message: "Forbidden: Admin access required" });
      }
    }
  }, reviewController.deleteReview);
}
