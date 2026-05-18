import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../config/prisma.js";
import { auth } from "../config/auth.js";

export class CouponController {
  async getAllCoupons(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    const isAdmin = session && (session.user.role === "admin" || session.user.role === "superAdmin");

    const coupons = await prisma.coupon.findMany({
      where: isAdmin ? {} : { isActive: true, endDate: { gte: new Date() } },
      orderBy: { createdAt: "desc" }
    });

    return { coupons };
  }

  async createCoupon(request: FastifyRequest, reply: FastifyReply) {
    const { code, discount, type, maxDiscount, minBooking, startDate, endDate, usageLimit } = request.body as any;

    if (!code || !discount) {
      return reply.status(400).send({ message: "Code and discount value are required" });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discount: parseFloat(discount),
        type: type || "percentage",
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        minBooking: minBooking ? parseFloat(minBooking) : null,
        startDate: new Date(startDate || new Date()),
        endDate: new Date(endDate),
        usageLimit: usageLimit ? parseInt(usageLimit) : null
      }
    });

    return { coupon };
  }

  async deleteCoupon(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    await prisma.coupon.delete({ where: { id } });
    return { success: true };
  }

  async applyCoupon(request: FastifyRequest, reply: FastifyReply) {
    const { code, totalPrice } = request.body as any;

    if (!code) {
      return reply.status(400).send({ message: "Coupon code is required" });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon || !coupon.isActive) {
      return reply.status(404).send({ message: "Invalid coupon code" });
    }

    const now = new Date();
    if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
      return reply.status(400).send({ message: "Coupon is expired or not active yet" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return reply.status(400).send({ message: "Coupon limit reached" });
    }

    if (coupon.minBooking && totalPrice < coupon.minBooking) {
      return reply.status(400).send({ message: `Minimum booking value of ₹${coupon.minBooking} required` });
    }

    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = (totalPrice * coupon.discount) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discount;
    }

    return {
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountAmount
      }
    };
  }
}

export const couponController = new CouponController();
