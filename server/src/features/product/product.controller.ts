import { FastifyRequest, FastifyReply } from 'fastify'
import { productService } from './product.service.js'
import { auth } from '../../config/auth.js'
import { notifyAllUsers } from '../../lib/notification.js'
import { io } from '../../lib/socket.js'

export class ProductController {
  async getAllProducts(request: FastifyRequest, _reply: FastifyReply) {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    const currentUserId = session?.user?.id

    const products = await productService.getAllProducts(request.query as any)

    products.forEach((p: any) => {
      if (
        p.user &&
        p.user.showProfile === false &&
        p.user.id !== currentUserId
      ) {
        p.user.image = null
      }
    })

    return { products }
  }

  async getRecentProducts(_request: FastifyRequest, _reply: FastifyReply) {
    const products = await productService.getRecentProducts()
    return { products }
  }

  async getProductById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })
    const currentUserId = session?.user?.id

    const product = await productService.getProductById(id)
    if (!product)
      return reply.status(404).send({ message: 'Product not found' })

    // Hide product if not available, unless user is owner or admin
    if (!product.isAvailable) {
      if (!currentUserId) {
        return reply
          .status(404)
          .send({ message: 'Product not found or unavailable' })
      }

      const isOwner =
        product.userId === currentUserId || product.user?.id === currentUserId
      const isAdmin = session?.user?.role === 'admin'

      if (!isOwner && !isAdmin) {
        return reply
          .status(404)
          .send({ message: 'Product not found or unavailable' })
      }
    }

    // Sanitize listing owner's image
    if (
      product.user &&
      product.user.showProfile === false &&
      product.user.id !== currentUserId
    ) {
      product.user.image = null
    }

    // Sanitize reviews authors' images
    if (product.reviews) {
      product.reviews.forEach((r: any) => {
        if (
          r.user &&
          r.user.showProfile === false &&
          r.user.id !== currentUserId
        ) {
          r.user.image = null
        }
      })
    }

    return { product }
  }

  async createProduct(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.id || (request.body as any).userId
      const product = await productService.createProduct({
        ...(request.body as any),
        userId,
      })

      // Notify all users about new product listing
      try {
        const creatorName =
          (request as any).user?.name ||
          (request as any).user?.email ||
          'Someone'
        const productImage = product.images?.[0] || ''
        await notifyAllUsers({
          title: 'New Listing Added! 🚀',
          message: `${creatorName} listed a new item: "${product.title}"`,
          type: 'info',
          url: `/products/${product.id}`,
          image: productImage,
          excludeUserId: userId,
        })
      } catch (err) {
        console.error('Failed to notify users of new product:', err)
      }

      try {
        io?.emit('product_added', { product })
      } catch (err) {
        console.error('Socket emit product_added failed:', err)
      }

      return { product }
    } catch (error: any) {
      if (
        error.message?.includes('Forbidden') ||
        error.message?.includes('limit')
      ) {
        return reply.status(403).send({ message: error.message })
      }
      return reply
        .status(500)
        .send({ message: error.message || 'Internal server error' })
    }
  }

  async updateProduct(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const user = (request as any).user
      const product = await productService.updateProduct(
        id,
        request.body,
        user?.id,
        user?.role,
      )
      
      try {
        io?.emit('product_updated', { productId: id, product })
      } catch (err) {
        console.error('Socket emit product_updated failed:', err)
      }
      
      return { product }
    } catch (error: any) {
      if (error.message.includes('Forbidden'))
        return reply.status(403).send({ message: error.message })
      if (error.message.includes('not found'))
        return reply.status(404).send({ message: error.message })
      return reply.status(500).send({ message: 'Internal server error' })
    }
  }

  async deleteProduct(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const user = (request as any).user
      await productService.deleteProduct(id, user?.id, user?.role)
      
      try {
        io?.emit('product_deleted', { productId: id })
      } catch (err) {
        console.error('Socket emit product_deleted failed:', err)
      }
      
      return { success: true }
    } catch (error: any) {
      if (error.message.includes('Forbidden'))
        return reply.status(403).send({ message: error.message })
      if (error.message.includes('not found'))
        return reply.status(404).send({ message: error.message })
      return reply.status(500).send({ message: 'Internal server error' })
    }
  }

  async toggleAvailability(request: FastifyRequest, _reply: FastifyReply) {
    const { id } = request.params as any
    const body = (request.body || {}) as any
    const query = (request.query || {}) as any
    const rawVal =
      body.isAvailable !== undefined ? body.isAvailable : query.isAvailable
    const isAvailable =
      typeof rawVal === 'string' ? rawVal === 'true' : !!rawVal

    const product = await productService.toggleAvailability(id, isAvailable)
    return { product }
  }

  async getMyListings(request: FastifyRequest, _reply: FastifyReply) {
    const userId = (request as any).user.id
    const products = await productService.getUserListings(userId)
    return { products }
  }

  async setFeaturedProduct(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      await productService.setFeaturedProduct(id)
      return { success: true }
    } catch (error: any) {
      console.error('setFeaturedProduct error:', error)
      if (error.message?.includes('not found'))
        return reply.status(404).send({ message: error.message })
      return reply.status(500).send({ message: 'Internal server error' })
    }
  }
}

export const productController = new ProductController()
