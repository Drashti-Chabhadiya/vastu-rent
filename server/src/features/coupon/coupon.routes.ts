import { FastifyInstance } from "fastify";
import { couponController } from "./coupon.controller.js";
import { auth } from "../../config/auth.js";

export async function couponRoutes(fastify: FastifyInstance) {
  // Public / Authenticated Routes
  fastify.get("/", couponController.getAllCoupons);
  fastify.post("/apply", couponController.applyCoupon);

  // Admin & Authorized Routes
  fastify.post("/", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session) {
        return reply.status(403).send({ message: "Forbidden: Unauthorized" });
      }
    }
  }, couponController.createCoupon);

  fastify.patch("/:id/approve", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session || session.user.role !== "admin") {
        return reply.status(403).send({ message: "Forbidden: Unauthorized" });
      }
    }
  }, couponController.approveCoupon);

  fastify.delete("/:id", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session) {
        return reply.status(403).send({ message: "Forbidden: Unauthorized" });
      }
    }
  }, couponController.deleteCoupon);

}
