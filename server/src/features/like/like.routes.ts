import { FastifyInstance } from "fastify";
import { likeController } from "./like.controller.js";
import { auth } from "../../config/auth.js";

export async function likeRoutes(fastify: FastifyInstance) {
  const authHandler = async (request: any, reply: any) => {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });
    request.user = session.user;
  };

  // Get liked product IDs (can be public, returns empty if not logged in)
  fastify.get("/ids", {
    preHandler: async (request: any, reply: any) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (session) request.user = session.user;
    }
  }, likeController.getLikedProductIds);

  // Get full liked products list
  fastify.get("/", {
    preHandler: async (request: any, reply: any) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (session) request.user = session.user;
    }
  }, likeController.getLikedProducts);

  // Toggle like (Requires Login)
  fastify.post("/toggle", { preHandler: [authHandler] }, likeController.toggleLike);

  // Dislike (Requires Login)
  fastify.post("/dislike", { preHandler: [authHandler] }, likeController.dislike);
}
