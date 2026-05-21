import { FastifyInstance } from "fastify";
import { deleteRequestController } from "./delete-request.controller.js";
import { auth } from "../../config/auth.js";

export async function deleteRequestRoutes(fastify: FastifyInstance) {
  const authHandler = async (request: any, reply: any) => {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });
    request.user = session.user;
  };

  fastify.post("/", { preHandler: [authHandler] }, deleteRequestController.createRequest);
  fastify.get("/", { preHandler: [authHandler] }, deleteRequestController.getAllRequests);
  fastify.get("/my", { preHandler: [authHandler] }, deleteRequestController.getMyRequests);
  fastify.patch("/:id/process", { preHandler: [authHandler] }, deleteRequestController.processRequest);
}
