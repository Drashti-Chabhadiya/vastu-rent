import { FastifyInstance } from "fastify";
import { userController } from "./user.controller.js";
import { auth } from "../../config/auth.js";

export async function userRoutes(fastify: FastifyInstance) {
  // Public Profile Route
  fastify.get("/profile/:id", userController.getPublicProfile);

  // User & Owner Settings Route
  fastify.patch("/settings", userController.updateSettings);

  // Cloudinary Settings Routes
  fastify.get("/settings/cloudinary", userController.getCloudinaryConfig);
  fastify.post("/settings/cloudinary", userController.saveCloudinaryConfig);
  fastify.post("/settings/cloudinary/test", userController.testCloudinaryConfig);
  fastify.get("/settings/cloudinary/usage", userController.getCloudinaryUsage);


  // Admin Routes (Encapsulated to prevent hook pollution on settings and profile routes)
  fastify.register(async (adminScope) => {
    adminScope.addHook("preHandler", async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session || (session.user.role !== "admin" && session.user.role !== "superAdmin")) {
        return reply.status(403).send({ message: "Forbidden: Admin access required" });
      }
    });

    adminScope.get("/", userController.getAllUsers);
    adminScope.get("/recent", userController.getRecentUsers);
    adminScope.post("/:id/ban", userController.banUser);
    adminScope.post("/:id/role", userController.updateUserRole);
    adminScope.delete("/:id", userController.deleteUser);
  });
}
