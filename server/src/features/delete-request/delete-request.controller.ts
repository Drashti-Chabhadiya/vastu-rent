import { FastifyRequest, FastifyReply } from "fastify";
import { deleteRequestService } from "./delete-request.service.js";

export class DeleteRequestController {
  async createRequest(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { productId, reason } = request.body as any;
      const user = (request as any).user;

      if (user.role !== "admin") {
        return reply.status(403).send({ message: "Only admins can create deletion requests" });
      }

      const deleteRequest = await deleteRequestService.createRequest(productId, user.id, reason);
      return { deleteRequest };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  }

  async getAllRequests(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      if (user.role !== "superAdmin") {
        return reply.status(403).send({ message: "Forbidden" });
      }

      const requests = await deleteRequestService.getAllRequests();
      return { requests };
    } catch (error: any) {
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async processRequest(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const { status } = request.body as any;
      const user = (request as any).user;

      if (user.role !== "superAdmin") {
        return reply.status(403).send({ message: "Forbidden" });
      }

      if (status !== "approved" && status !== "rejected") {
        return reply.status(400).send({ message: "Invalid status" });
      }

      const deleteRequest = await deleteRequestService.updateRequestStatus(id, status, user.id);
      return { deleteRequest };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  }

  async getMyRequests(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const requests = await deleteRequestService.getMyRequests(user.id);
      return { requests };
    } catch (error: any) {
      return reply.status(500).send({ message: "Internal server error" });
    }
  }
}

export const deleteRequestController = new DeleteRequestController();
