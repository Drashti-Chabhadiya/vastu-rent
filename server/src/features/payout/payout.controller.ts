import { FastifyRequest, FastifyReply } from "fastify";
import { payoutService } from "./payout.service.js";

export class PayoutController {
  async getEarningsDashboard(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;

    if (user.role !== "owner" && user.role !== "admin" && user.role !== "superAdmin") {
      return reply.status(403).send({ message: "Forbidden: Access restricted to listing owners and admins" });
    }

    // Admins can query dashboard stats of other owners, fallback to active user
    let targetOwnerId = user.id;
    const { ownerId } = request.query as { ownerId?: string };
    if (ownerId && (user.role === "admin" || user.role === "superAdmin")) {
      targetOwnerId = ownerId;
    }

    try {
      const data = await payoutService.getEarningsDashboard(targetOwnerId);
      return data;
    } catch (error: any) {
      return reply.status(500).send({ message: error.message || "Failed to fetch earnings analytics" });
    }
  }

  async createPayoutRequest(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;
    const { amount } = request.body as { amount: number };

    try {
      const payout = await payoutService.createPayoutRequest(user.id, amount);
      return { payout };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Failed to create payout request" });
    }
  }

  async getAllPayoutRequests(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return reply.status(403).send({ message: "Forbidden: Admin access required" });
    }

    try {
      const payouts = await payoutService.getAllPayoutRequests();
      return { payouts };
    } catch (error: any) {
      return reply.status(500).send({ message: error.message || "Failed to retrieve payout requests" });
    }
  }

  async updatePayoutStatus(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;
    const { id } = request.params as { id: string };
    const { status, notes } = request.body as { status: string; notes?: string };

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return reply.status(403).send({ message: "Forbidden: Admin access required" });
    }

    try {
      const payout = await payoutService.updatePayoutStatus(id, status, notes);
      return { payout };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Failed to update payout request status" });
    }
  }
}

export const payoutController = new PayoutController();
