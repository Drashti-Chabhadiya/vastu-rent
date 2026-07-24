import { FastifyRequest, FastifyReply } from 'fastify'
import { likeService } from './like.service.js'

export class LikeController {
  async toggleLike(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user?.id
    if (!userId) return reply.status(401).send({ message: 'Unauthorized' })

    const { productId } = request.body as any
    if (!productId)
      return reply.status(400).send({ message: 'Product ID is required' })

    const result = await likeService.toggleLike(userId, productId)
    return result
  }

  async dislike(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user?.id
    if (!userId) return reply.status(401).send({ message: 'Unauthorized' })

    const { productId } = request.body as any
    if (!productId)
      return reply.status(400).send({ message: 'Product ID is required' })

    const result = await likeService.dislike(userId, productId)
    return result
  }

  async getLikedProductIds(request: FastifyRequest, _reply: FastifyReply) {
    const userId = (request as any).user?.id
    if (!userId) return { productIds: [] }

    const productIds = await likeService.getLikedProductIds(userId)
    return { productIds }
  }

  async getLikedProducts(request: FastifyRequest, _reply: FastifyReply) {
    const userId = (request as any).user?.id
    if (!userId) return { products: [] }

    const products = await likeService.getLikedProducts(userId)
    return { products }
  }
}

export const likeController = new LikeController()
