import { FastifyRequest, FastifyReply } from "fastify";
import { billingService } from "./billing.service.js";

export class BillingController {
  async createCheckoutSession(request: FastifyRequest, reply: FastifyReply) {
    const { planName, interval } = request.body as { planName: string; interval: string };
    const user = (request as any).user;

    if (!planName || !interval) {
      return reply.status(400).send({ message: "Plan name and interval are required" });
    }

    try {
      const session = await billingService.createCheckoutSession(user.id, planName, interval);
      return session;
    } catch (error: any) {
      return reply.status(500).send({ message: error.message });
    }
  }

  async verifyCheckoutSession(request: FastifyRequest, reply: FastifyReply) {
    const { sessionId } = request.body as { sessionId: string };

    if (!sessionId) {
      return reply.status(400).send({ message: "Session ID is required" });
    }

    try {
      const result = await billingService.verifyCheckoutSession(sessionId);
      return result;
    } catch (error: any) {
      return reply.status(500).send({ message: error.message });
    }
  }
}

export const billingController = new BillingController();
