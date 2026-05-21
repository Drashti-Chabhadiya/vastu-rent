import { prisma } from "../../config/prisma.js";

export class LikeService {
  async toggleLike(userId: string, productId: string) {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return { liked: false };
    } else {
      await prisma.like.create({
        data: { userId, productId },
      });
      return { liked: true };
    }
  }

  async dislike(userId: string, productId: string) {
    // In this context, dislike just ensures the product is NOT liked by the user.
    // If we wanted a separate dislike counter, we would need a Dislike model.
    await prisma.like.deleteMany({
      where: { userId, productId },
    });
    return { liked: false };
  }

  async getLikedProductIds(userId: string) {
    const likes = await prisma.like.findMany({
      where: { userId },
      select: { productId: true },
    });
    return likes.map((l: any) => l.productId);
  }

  async getLikedProducts(userId: string) {
    const likes = await prisma.like.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            owner: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    });
    return likes.map((l: any) => l.product);
  }
}

export const likeService = new LikeService();
