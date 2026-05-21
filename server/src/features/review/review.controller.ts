import { FastifyRequest, FastifyReply } from "fastify";
import { reviewService } from "./review.service.js";

export class ReviewController {
  async getAllReviews(request: FastifyRequest, reply: FastifyReply) {
    const { search, productId } = request.query as any;
    const reviews = await reviewService.getAllReviews(search, productId);
    return { reviews };
  }

  async deleteReview(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    await reviewService.deleteReview(id);
    return { success: true };
  }

  async createReview(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user.id;
    const review = await reviewService.createReview({ ...request.body as any, userId });
    return { review };
  }
}

export const reviewController = new ReviewController();
