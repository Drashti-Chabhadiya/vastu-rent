import { FastifyInstance } from "fastify";
import { categoryController } from "./category.controller.js";
import { auth } from "../../config/auth.js";
import { isAdminRole } from "../../config/roles.js";
import { categoryDeleteRequestService } from "../category-delete-request/category-delete-request.service.js";

export async function categoryRoutes(fastify: FastifyInstance) {
  // Public Routes
  fastify.get("/", categoryController.getAllCategories);

  // Admin Routes (Prefixed with /api/admin/categories in app.ts)
  // We'll handle both public and admin in the same file but protect specific methods
  fastify.post("/", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session || !isAdminRole(session.user.role)) {
        return reply.status(403).send({ message: "Forbidden: Admin access required" });
      }
    }
  }, categoryController.createCategory);

  fastify.put("/:id", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session || !isAdminRole(session.user.role)) {
        return reply.status(403).send({ message: "Forbidden: Admin access required" });
      }
    }
  }, categoryController.updateCategory);

  fastify.delete("/:id", {
    preHandler: async (request: any, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const isAuthorized = await categoryDeleteRequestService.verifyDeletePermission(
        request.params.id,
        session.user.id || "",
        session.user.role || ""
      );

      if (!isAuthorized) {
        return reply.status(403).send({ message: "Forbidden: You do not have permission to delete this category" });
      }

      request.user = session.user;
    }
  }, categoryController.deleteCategory);
}
