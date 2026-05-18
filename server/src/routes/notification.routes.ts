import { FastifyInstance } from "fastify";
import { notificationController } from "../controllers/notification.controller.js";
import { auth } from "../config/auth.js";

export async function notificationRoutes(fastify: FastifyInstance) {
  // Pre-handler check to ensure the user is logged in
  fastify.addHook("preHandler", async (request, reply) => {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
  });

  fastify.get("/", notificationController.getNotifications);
  fastify.put("/:id/read", notificationController.markAsRead);
  fastify.put("/read-all", notificationController.markAllAsRead);
}
