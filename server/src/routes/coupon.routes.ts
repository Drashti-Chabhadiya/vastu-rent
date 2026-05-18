import { FastifyInstance } from "fastify";
import { couponController } from "../controllers/coupon.controller.js";
import { auth } from "../config/auth.js";

export async function couponRoutes(fastify: FastifyInstance) {
  // Public / Authenticated Routes
  fastify.get("/", couponController.getAllCoupons);
  fastify.post("/apply", couponController.applyCoupon);

  // Admin / Super Admin Routes
  fastify.post("/", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session || (session.user.role !== "admin" && session.user.role !== "superAdmin")) {
        return reply.status(403).send({ message: "Forbidden: Admin access required" });
      }
    }
  }, couponController.createCoupon);

  fastify.delete("/:id", {
    preHandler: async (request, reply) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session || (session.user.role !== "admin" && session.user.role !== "superAdmin")) {
        return reply.status(403).send({ message: "Forbidden: Admin access required" });
      }
    }
  }, couponController.deleteCoupon);
}
