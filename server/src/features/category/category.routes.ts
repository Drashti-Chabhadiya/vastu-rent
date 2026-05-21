import { FastifyInstance } from "fastify";
import { categoryController } from "./category.controller.js";
import { auth } from "../../config/auth.js";

export async function categoryRoutes(fastify: FastifyInstance) {
  // Public Routes
  fastify.get("/", categoryController.getAllCategories);

  // Admin Routes (Prefixed with /api/admin/categories in app.ts)
  // We'll handle both public and admin in the same file but protect specific methods
  fastify.post("/", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session || (session.user.role !== "admin" && session.user.role !== "superAdmin")) {
        return reply.status(403).send({ message: "Forbidden: Admin access required" });
      }
    }
  }, categoryController.createCategory);

  fastify.put("/:id", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session || (session.user.role !== "admin" && session.user.role !== "superAdmin")) {
        return reply.status(403).send({ message: "Forbidden: Admin access required" });
      }
    }
  }, categoryController.updateCategory);

  fastify.delete("/:id", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session || (session.user.role !== "admin" && session.user.role !== "superAdmin")) {
        return reply.status(403).send({ message: "Forbidden: Admin access required" });
      }
    }
  }, categoryController.deleteCategory);
}
