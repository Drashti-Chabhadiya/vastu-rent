import { FastifyInstance } from "fastify";
import { categoryRequestController } from "../controllers/category-request.controller.js";
import { auth } from "../config/auth.js";

export async function categoryRequestRoutes(fastify: FastifyInstance) {
  // Owner Route
  fastify.post("/", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session) {
        return reply.status(401).send({ message: "Unauthorized" });
      }
    }
  }, categoryRequestController.createRequest);

  fastify.get("/", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session) {
        return reply.status(401).send({ message: "Unauthorized" });
      }
    }
  }, categoryRequestController.getAllRequests);

  fastify.put("/:id/status", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session || (session.user.role !== "admin" && session.user.role !== "superAdmin")) {
        return reply.status(403).send({ message: "Forbidden: Admin access required" });
      }
    }
  }, categoryRequestController.updateStatus);
}
