import { prisma } from "../../config/prisma.js";

export class ReviewService {
  async getAllReviews(search?: string, productId?: string) {
    const where: any = {};
    if (productId) where.productId = productId;
    if (search) {
      where.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { product: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        product: { select: { id: true, title: true } },
      },
    });
  }

  async deleteReview(id: string) {
    return prisma.review.delete({ where: { id } });
  }

  async createReview(data: { rating: number; comment?: string; productId: string; userId: string }) {
    return prisma.review.create({
      data,
      include: { user: { select: { id: true, name: true, image: true } } },
    });
  }
}

export const reviewService = new ReviewService();
