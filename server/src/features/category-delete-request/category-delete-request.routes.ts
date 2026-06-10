import { FastifyInstance } from "fastify";
import { categoryDeleteRequestController } from "./category-delete-request.controller.js";
import { auth } from "../../config/auth.js";

export async function categoryDeleteRequestRoutes(fastify: FastifyInstance) {
  const authHandler = async (request: any, reply: any) => {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });
    request.user = session.user;
  };

  fastify.post("/", { preHandler: [authHandler] }, categoryDeleteRequestController.createRequest);
  fastify.get("/", { preHandler: [authHandler] }, categoryDeleteRequestController.getAllRequests);
  fastify.patch("/:id/process", { preHandler: [authHandler] }, categoryDeleteRequestController.processRequest);
}
