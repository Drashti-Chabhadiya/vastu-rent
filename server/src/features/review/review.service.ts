import { prisma } from '../../config/prisma.js'
import { createAndDeliverNotification } from '../../lib/notification.js'

export class ReviewService {
  async getAllReviews(
    search?: string,
    productId?: string,
    userId?: string,
    userRole?: string,
  ) {
    const where: any = {}

    // 1. If productId is provided, filter reviews by that product (public page listing details)
    if (productId) {
      where.productId = productId
    } else if (userId && userRole) {
      // 2. If it is a dashboard reviews request (no productId), apply strict role-based filtering:
      if (userRole === 'admin') {
        // Admin can see all reviews (no additional filter)
      } else {
        // Regular users can see reviews for their own listings/products OR reviews they submitted
        where.OR = [{ product: { userId: userId } }, { userId: userId }]
      }
    }

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { product: { title: { contains: search, mode: 'insensitive' } } },
      ]
    }

    return prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            showProfile: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            city: true,
            images: true,
            user: {
              select: { id: true, name: true, image: true, showProfile: true },
            },
          },
        },
      },
    })
  }

  async deleteReview(id: string) {
    return prisma.review.delete({ where: { id } })
  }

  async createReview(data: {
    rating: number
    comment?: string
    productId: string
    userId: string
  }) {
    const { productId, userId } = data

    // Rule 3: Lister Cannot Review Their Own Listing
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { userId: true },
    })

    if (!product) {
      throw new Error('Product listing not found')
    }

    if (product.userId === userId) {
      throw new Error('Listers are not allowed to review their own listings.')
    }

    // Rule 2: One Booking = One Review (Enforce exactly one review per listing per user, but allow updates within 7 days)
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId,
      },
    })

    if (existingReview) {
      const daysDiff =
        (new Date().getTime() - new Date(existingReview.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
      if (daysDiff > 7) {
        throw new Error(
          'Reviews can only be edited within 7 days of submission.',
        )
      }

      return prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: data.rating,
          comment: data.comment,
        },
        include: {
          user: {
            select: { id: true, name: true, image: true, showProfile: true },
          },
        },
      })
    }

    // Rule 1: Only Completed Bookings Can Be Reviewed
    const completedRental = await prisma.rental.findFirst({
      where: {
        productId,
        renterId: userId,
        status: { in: ['completed', 'returned'] },
      },
    })

    if (!completedRental) {
      throw new Error(
        'You can only review listings after completing a booking.',
      )
    }

    const createdReview = await prisma.review.create({
      data,
      include: {
        user: {
          select: { id: true, name: true, image: true, showProfile: true },
        },
        product: true,
      },
    })

    // Notify listing provider
    try {
      await createAndDeliverNotification({
        userId: createdReview.product.userId,
        title: 'New Review Received! ⭐',
        message: `${createdReview.user.name} rated your product "${createdReview.product.title}" with ${createdReview.rating} stars.`,
        type: 'alert',
      })
    } catch (err) {
      console.error('Failed to deliver review creation notification:', err)
    }

    return createdReview
  }

  async replyToReview(id: string, replyText: string, userId: string) {
    const review = await prisma.review.findUnique({
      where: { id },
      include: { product: true },
    })
    if (!review) throw new Error('Review not found')
    if (review.product.userId !== userId) {
      throw new Error('Only the listing provider can reply to this review.')
    }

    // Append the reply to the comment
    // Strip existing reply if any
    const cleanComment = review.comment
      ? review.comment.split('\n\n[Reply:')[0]
      : ''
    const newComment = `${cleanComment}\n\n[Reply: ${replyText}]`

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { comment: newComment },
      include: {
        product: true,
        user: true, // The reviewer
      },
    })

    // Notify reviewer
    try {
      await createAndDeliverNotification({
        userId: updatedReview.userId,
        title: 'New Reply to Your Review! 💬',
        message: `The host replied to your review on "${updatedReview.product.title}".`,
        type: 'info',
      })
    } catch (err) {
      console.error('Failed to deliver review reply notification:', err)
    }

    return updatedReview
  }
}

export const reviewService = new ReviewService()
