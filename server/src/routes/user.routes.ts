import { FastifyInstance } from "fastify";
import { userController } from "../controllers/user.controller.js";
import { auth } from "../config/auth.js";

export async function userRoutes(fastify: FastifyInstance) {
  // Public Profile Route
  fastify.get("/profile/:id", userController.getPublicProfile);

  // User & Owner Settings Route
  fastify.patch("/settings", userController.updateSettings);

  // Admin Routes (Prefixed with /api/admin/users in app.ts)
  fastify.addHook("preHandler", async (request, reply) => {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session || (session.user.role !== "admin" && session.user.role !== "superAdmin")) {
      return reply.status(403).send({ message: "Forbidden: Admin access required" });
    }
  });

  fastify.get("/", userController.getAllUsers);
  fastify.get("/recent", userController.getRecentUsers);
  fastify.post("/:id/ban", userController.banUser);
  fastify.post("/:id/role", userController.updateUserRole);
  fastify.delete("/:id", userController.deleteUser);
}
