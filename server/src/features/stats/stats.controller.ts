import { FastifyRequest, FastifyReply } from "fastify";
import { userService } from "../user/user.service.js";
import { productService } from "../product/product.service.js";
import { rentalService } from "../rental/rental.service.js";
import { prisma } from "../../config/prisma.js";

export class StatsController {
  async getDashboardStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const [users, products, rentalStats] = await Promise.all([
        userService.getAllUsers({}),
        productService.getAllProducts({}),
        rentalService.getStats(),
      ]);

      return {
        stats: {
          totalUsers: users.length,
          totalListings: products.length,
          totalBookings: rentalStats.totalBookings,
          totalRevenue: rentalStats.totalRevenue,
        }
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async getBookingsOverTime(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { period = "week" } = request.query as { period?: string };

      let days = 7;
      if (period === "month") days = 30;
      if (period === "year") days = 365;

      const since = new Date();
      since.setDate(since.getDate() - days);

      const rentals = await prisma.rental.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      });

      // Group by date label
      const grouped: Record<string, number> = {};
      rentals.forEach((r) => {
        const label =
          period === "year"
            ? r.createdAt.toLocaleString("en-IN", { month: "short", year: "2-digit" })
            : r.createdAt.toLocaleString("en-IN", { month: "short", day: "numeric" });
        grouped[label] = (grouped[label] || 0) + 1;
      });

      const data = Object.entries(grouped).map(([date, bookings]) => ({ date, bookings }));
      return { data };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async getRevenueOverTime(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { period = "month" } = request.query as { period?: string };

      let days = 30;
      if (period === "week") days = 7;
      if (period === "year") days = 365;

      const since = new Date();
      since.setDate(since.getDate() - days);

      const rentals = await prisma.rental.findMany({
        where: {
          createdAt: { gte: since },
          status: { in: ["confirmed", "active", "completed", "approved"] },
        },
        select: { createdAt: true, totalPrice: true },
        orderBy: { createdAt: "asc" },
      });

      // Group by date label
      const grouped: Record<string, number> = {};
      rentals.forEach((r) => {
        const label =
          period === "year"
            ? r.createdAt.toLocaleString("en-IN", { month: "short", year: "2-digit" })
            : r.createdAt.toLocaleString("en-IN", { month: "short", day: "numeric" });
        grouped[label] = (grouped[label] || 0) + (r.totalPrice || 0);
      });

      const totalRevenue = rentals.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
      const data = Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));

      return { data, totalRevenue };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async getTopCities(request: FastifyRequest, reply: FastifyReply) {
    try {
      const products = await prisma.product.findMany({
        select: { city: true },
        where: { city: { not: null } },
      });

      const cityCount: Record<string, number> = {};
      products.forEach((p: any) => {
        if (p.city) {
          cityCount[p.city] = (cityCount[p.city] || 0) + 1;
        }
      });

      const sorted = Object.entries(cityCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const max = sorted[0]?.[1] || 1;
      const cities = sorted.map(([name, count]) => ({
        name,
        count: count.toLocaleString("en-IN"),
        percentage: Math.round((count / max) * 100),
      }));

      return { cities };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async getRecentReviews(request: FastifyRequest, reply: FastifyReply) {
    try {
      const reviews = await prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, image: true } },
          product: { select: { id: true, title: true, images: true } },
        },
      });
      return { reviews };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  }
}

export const statsController = new StatsController();
