import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../config/prisma.js";
import { auth } from "../../config/auth.js";
import { isAdminRole } from "../../config/roles.js";

export class CouponController {
  async getAllCoupons(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    
    let whereClause: any = { isActive: true, endDate: { gte: new Date() } };

    if (session) {
      const role = session.user.role;
      if (isAdminRole(role)) {
        whereClause = {}; // Admins see everything
      } else {
        // Regular users (including owners) can see their own coupons and active global coupons.
        whereClause = {
          OR: [
            { ownerId: session.user.id },
            { ownerId: null, isActive: true, endDate: { gte: new Date() } }
          ]
        };
      }
    }

    const coupons = await prisma.coupon.findMany({
      where: whereClause,
      include: {
        product: { select: { title: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return { coupons };
  }

  async createCoupon(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

        const { code, discount, type, maxDiscount, minBooking, startDate, endDate, usageLimit, perUserLimit, productId } = request.body as any;

    if (!code || !discount) {
      return reply.status(400).send({ message: "Code and discount value are required" });
    }

    let couponOwnerId: string | null = null;
    let couponProductId: string | null = null;

    const role = session.user.role;

    if (role === "owner" || role === "user") {
      couponOwnerId = session.user.id;
      // If a product restriction is requested, verify ownership
      if (productId) {
        const product = await prisma.product.findUnique({
          where: { id: productId }
        });
        if (!product || product.ownerId !== session.user.id) {
          return reply.status(403).send({ message: "You can only create coupons for your own listings" });
        }
        couponProductId = productId;
      }
    } else if (isAdminRole(role)) {
      // Admins can set ownerId or productId arbitrarily
      couponOwnerId = (request.body as any).ownerId || null;
      couponProductId = productId || null;
    } else {
      return reply.status(403).send({ message: "Forbidden" });
    }

    // Check if code is already taken
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });
    if (existingCoupon) {
      return reply.status(400).send({ message: "A coupon with this code already exists" });
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
        isActive: isAdminRole(role),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : null,
        ownerId: couponOwnerId,
        productId: couponProductId
      }
    });

    return { coupon };
  }

  async deleteCoupon(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const { id } = request.params as any;
    const coupon = await prisma.coupon.findUnique({ where: { id } });

    if (!coupon) {
      return reply.status(404).send({ message: "Coupon not found" });
    }

    const role = session.user.role;
    if (role !== "admin" && role !== "superAdmin") {
      if (coupon.ownerId !== session.user.id) {
        return reply.status(403).send({ message: "You can only delete your own coupons" });
      }
    }

    await prisma.coupon.delete({ where: { id } });
    return { success: true };
  }

  async applyCoupon(request: FastifyRequest, reply: FastifyReply) {
    const { code, totalPrice, productId } = request.body as any;

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

    // Per-user redemption limit validation
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (coupon.perUserLimit) {
      if (!session) {
        return reply.status(401).send({ message: "Authentication required to apply this coupon" });
      }
      const userUsageCount = await prisma.rental.count({
        where: {
          renterId: session.user.id,
          couponId: coupon.id,
          status: { notIn: ["cancelled", "rejected"] }
        }
      });
      if (userUsageCount >= coupon.perUserLimit) {
        const limitMsg = coupon.perUserLimit === 1
          ? "You have already used this coupon code"
          : `This coupon can only be used ${coupon.perUserLimit} time(s) per user`;
        return reply.status(400).send({ message: limitMsg });
      }
    }

    if (coupon.minBooking && totalPrice < coupon.minBooking) {
      return reply.status(400).send({ message: `Minimum booking value of ₹${coupon.minBooking} required` });
    }

    // Owner or Product specific validation
    if (coupon.ownerId || coupon.productId) {
      if (!productId) {
        return reply.status(400).send({ message: "Product context is required to apply this coupon" });
      }
      
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { owner: { select: { name: true } } }
      });

      if (!product) {
        return reply.status(404).send({ message: "Product not found" });
      }

      if (coupon.productId && coupon.productId !== productId) {
        return reply.status(400).send({ message: "This coupon is only valid for a specific listing" });
      }

      if (coupon.ownerId && product.ownerId !== coupon.ownerId) {
        return reply.status(400).send({ message: `This coupon is only valid for listings from ${product.owner?.name || 'this owner'}` });
      }
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

  async approveCoupon(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session || !isAdminRole(session.user.role)) {
      return reply.status(403).send({ message: "Forbidden" });
    }

    const { id } = request.params as any;
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return reply.status(404).send({ message: "Coupon not found" });
    }

    if (coupon.isActive) {
      return reply.status(400).send({ message: "Coupon is already active" });
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: { isActive: true }
    });

    return { coupon: updatedCoupon };
  }
}

export const couponController = new CouponController();
