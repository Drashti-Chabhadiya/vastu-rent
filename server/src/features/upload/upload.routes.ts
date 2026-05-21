import { FastifyInstance } from "fastify";
import { uploadController } from "./upload.controller.js";
import { auth } from "../../config/auth.js";

export async function uploadRoutes(app: FastifyInstance) {
  // Authentication middleware for upload routes
  const authHandler = async (request: any, reply: any) => {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized: Please log in." });
    }
    request.user = session.user;
  };

  app.post("/profile", { preHandler: [authHandler] }, uploadController.uploadProfileImage);
  app.post("/product", { preHandler: [authHandler] }, uploadController.uploadProductImage);
}
