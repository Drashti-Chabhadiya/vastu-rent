import { FastifyInstance } from "fastify";
import { disputeController } from "./dispute.controller.js";
import { auth } from "../../config/auth.js";

export async function disputeRoutes(fastify: FastifyInstance) {
  // Authenticated User Route
  fastify.post("/", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session) {
        return reply.status(401).send({ message: "Unauthorized" });
      }
    }
  }, disputeController.createDispute);

  // Admin Routes
  fastify.get("/", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session || (session.user.role !== "admin" && session.user.role !== "superAdmin")) {
        return reply.status(403).send({ message: "Forbidden: Admin access required" });
      }
    }
  }, disputeController.getAllDisputes);

  fastify.put("/:id/resolve", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session || (session.user.role !== "admin" && session.user.role !== "superAdmin")) {
        return reply.status(403).send({ message: "Forbidden: Admin access required" });
      }
    }
  }, disputeController.resolveDispute);
}
