import { FastifyRequest, FastifyReply } from "fastify";
import { reviewService } from "./review.service.js";
import { auth } from "../../config/auth.js";

export class ReviewController {
  async getAllReviews(request: FastifyRequest, _reply: FastifyReply) {
    const { search, productId } = request.query as any;
    
    // Get session to check roles and filter
    const session = await auth.api.getSession({ headers: request.headers as any });
    
    let userId: string | undefined;
    let userRole: string | undefined;
    if (session?.user) {
      userId = session.user.id ?? undefined;
      userRole = session.user.role ?? undefined;
    }
    
    const reviews = await reviewService.getAllReviews(search, productId, userId, userRole);
    
    const currentUserId = session?.user?.id;
    reviews.forEach((r: any) => {
      if (r.user && r.user.showProfile === false && r.user.id !== currentUserId) {
        r.user.image = null;
      }
      if (r.product && r.product.user && r.product.user.showProfile === false && r.product.user.id !== currentUserId) {
        r.product.user.image = null;
      }
    });

    return { reviews };
  }

  async deleteReview(request: FastifyRequest, _reply: FastifyReply) {
    const { id } = request.params as any;
    await reviewService.deleteReview(id);
    return { success: true };
  }

  async createReview(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user.id;
    try {
      const review = await reviewService.createReview({ ...request.body as any, userId });
      return { review };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Failed to submit review" });
    }
  }

  async replyToReview(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { replyText } = request.body as { replyText: string };
    const userId = (request as any).user.id;
    try {
      const review = await reviewService.replyToReview(id, replyText, userId);
      return { review };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Failed to submit reply" });
    }
  }
}

export const reviewController = new ReviewController();
