import { FastifyRequest, FastifyReply } from "fastify";
import { categoryDeleteRequestService } from "./category-delete-request.service.js";
import { auth } from "../../config/auth.js";
import { isAdminRole } from "../../config/roles.js";

export class CategoryDeleteRequestController {
  async createRequest(request: FastifyRequest, reply: FastifyReply) {
    try {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const { categoryId, reason } = request.body as any;
      if (!categoryId) {
        return reply.status(400).send({ message: "Category ID is required" });
      }

      const deleteRequest = await categoryDeleteRequestService.createRequest(
        categoryId,
        session.user.id,
        reason
      );
      return { deleteRequest };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  }

  async getAllRequests(request: FastifyRequest, reply: FastifyReply) {
    try {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const { id: userId, role } = session.user;
      const requests = await categoryDeleteRequestService.getAllRequests(userId || "", role || "user");
      return { requests };
    } catch (error: any) {
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async processRequest(request: FastifyRequest, reply: FastifyReply) {
    try {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session || !isAdminRole(session.user.role)) {
        return reply.status(403).send({ message: "Forbidden: Admin access required" });
      }

      const { id } = request.params as any;
      const { status } = request.body as any;

      if (status !== "approved" && status !== "rejected") {
        return reply.status(400).send({ message: "Invalid status" });
      }

      const deleteRequest = await categoryDeleteRequestService.updateRequestStatus(
        id,
        status,
        session.user.id
      );
      return { deleteRequest };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  }
}

export const categoryDeleteRequestController = new CategoryDeleteRequestController();
