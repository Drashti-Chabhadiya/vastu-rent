import { prisma } from '../../config/prisma.js'
import {
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelPattern,
} from '../../lib/redis-cache.js'
import { CACHE_KEYS, CACHE_TTLS } from '../../constants/cache-keys.js'
import { imageQueue } from '../../queues/queues.js'
import { JOB_NAMES } from '../../constants/queue-keys.js'
import { syncGreenMemberStatus } from '../../lib/green-member.helper.js'
import { cloudinaryService } from '../upload/cloudinary.service.js'

export class ProductService {
  async getAllProducts(filters: {
    search?: string
    categoryId?: string
    status?: string
    minPrice?: string
    maxPrice?: string
    isAvailable?: boolean
    ids?: string | string[]
    city?: string
    isFeatured?: boolean | string
  }) {
    const cacheKey = CACHE_KEYS.PRODUCTS_LIST(filters)
    const cachedProducts = await cacheGet<any[]>(cacheKey)
    if (cachedProducts) {
      return cachedProducts
    }

    const {
      search,
      categoryId,
      status,
      minPrice,
      maxPrice,
      isAvailable,
      ids,
      city,
      isFeatured,
    } = filters
    const where: any = {}

    if (ids) {
      const idArray = Array.isArray(ids) ? ids : ids.split(',')
      where.id = { in: idArray }
    }

    if (isAvailable !== undefined) where.isAvailable = isAvailable
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured === true || isFeatured === 'true'
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (categoryId) where.categoryId = categoryId
    if (status === 'available' || status === 'active') where.isAvailable = true
    if (status === 'unavailable' || status === 'inactive')
      where.isAvailable = false

    if (city) {
      where.city = { equals: city, mode: 'insensitive' }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            showProfile: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
        _count: {
          select: { reviews: true },
        },
      },
    })

    const result = products.map((p: any) => ({
      ...p,
      reviewsCount: p._count.reviews,
      rating:
        p.reviews.length > 0
          ? (
              p.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
              p.reviews.length
            ).toFixed(1)
          : '5.0',
    }))

    await cacheSet(cacheKey, result, CACHE_TTLS.PRODUCTS) // cache list for 1 hour

    return result
  }

  async getRecentProducts() {
    const cacheKey = CACHE_KEYS.PRODUCTS_RECENT
    const cached = await cacheGet<any[]>(cacheKey)
    if (cached) return cached

    const products = await prisma.product.findMany({
      where: { isAvailable: true },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        user: { select: { name: true } },
      },
    })

    await cacheSet(cacheKey, products, CACHE_TTLS.PRODUCTS) // cache recent products for 1 hour

    return products
  }

  async getProductById(id: string) {
    // Increment view count in database first for live view tracking
    const updated = await prisma.product
      .update({
        where: { id },
        data: { views: { increment: 1 } },
        select: { views: true },
      })
      .catch(() => null)

    const cacheKey = CACHE_KEYS.PRODUCT_DETAIL(id)
    const cached = await cacheGet<any>(cacheKey)
    if (cached) {
      if (updated?.views !== undefined) {
        cached.views = updated.views
      }
      return cached
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          include: {
            products: {
              include: {
                reviews: {
                  select: { rating: true },
                },
              },
            },
            _count: {
              select: { products: true },
            },
            addresses: {
              take: 1,
              orderBy: { isDefault: 'desc' },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                showProfile: true,
                instagramUrl: true,
                facebookUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { reviews: true },
        },
      },
    })

    if (!product) return null

    if (updated?.views !== undefined) {
      product.views = updated.views
    }

    let userTotalRating = 0
    let userReviewCount = 0
    product.user.products.forEach((p: any) => {
      p.reviews.forEach((r: any) => {
        userTotalRating += r.rating
        userReviewCount++
      })
    })
    const userRating =
      userReviewCount > 0
        ? (userTotalRating / userReviewCount).toFixed(1)
        : '5.0'

    const sellerAddress = (product.user as any).addresses?.[0]

    const result = {
      ...product,
      reviewsCount: product._count.reviews,
      rating:
        product.reviews.length > 0
          ? (
              product.reviews.reduce(
                (acc: number, r: any) => acc + r.rating,
                0,
              ) / product.reviews.length
            ).toFixed(1)
          : '5.0',
      user: {
        id: product.user.id,
        name: product.user.name,
        image: product.user.image,
        createdAt: product.user.createdAt,
        rating: userRating,
        listingsCount: product.user._count.products,
        showProfile: product.user.showProfile,
        instagramUrl: product.user.instagramUrl,
        facebookUrl: product.user.facebookUrl,
        googleMapLink: sellerAddress?.googleMapLink || null,
        address: sellerAddress || null,
      },
    }

    await cacheSet(cacheKey, result, CACHE_TTLS.PRODUCTS) // cache detail for 1 hour

    return result
  }

  async createProduct(data: any) {
    if (!data.userId) {
      throw new Error('User ID is required to create a listing')
    }

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { subscriptionTier: true, subscriptionExpiresAt: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    let tier = (user.subscriptionTier || 'Starter').toLowerCase()
    if (user.subscriptionExpiresAt && user.subscriptionExpiresAt < new Date()) {
      tier = 'starter'
    }

    const listingCount = await prisma.product.count({
      where: { userId: data.userId },
    })

    if (tier === 'starter' && listingCount >= 5) {
      throw new Error(
        'Forbidden: You have reached the limit of 5 listings for the Starter plan. Please upgrade your plan to list more items.',
      )
    }

    if (tier === 'pro' && listingCount >= 50) {
      throw new Error(
        'Forbidden: You have reached the limit of 50 listings for the Pro plan. Please upgrade to the Business plan to list more items.',
      )
    }

    const { location, ...cleanData } = data
    if (!cleanData.city && location) {
      cleanData.city = location
    }

    const product = await prisma.product.create({
      data: {
        ...cleanData,
        price: parseFloat(data.price),
        securityDeposit: data.securityDeposit
          ? parseFloat(data.securityDeposit)
          : 0,
        images: data.images || [],
        isAvailable: true,
      },
    })

    // Invalidate product caches and categories count cache
    await Promise.all([
      cacheDel([CACHE_KEYS.PRODUCTS_RECENT, CACHE_KEYS.CATEGORIES_ALL]),
      cacheDelPattern(CACHE_KEYS.PRODUCTS_LIST_PATTERN),
    ])

    // Dispatch background image optimization
    if (product.images && product.images.length > 0) {
      try {
        await imageQueue.add(JOB_NAMES.IMAGE.OPTIMIZE_IMAGE, {
          entityId: product.id,
          entityType: 'product',
          imageUrls: product.images,
        })
      } catch (err) {
        console.error(
          'Failed to queue product image optimization on create:',
          err,
        )
      }
    }

    try {
      await syncGreenMemberStatus(data.userId)
    } catch (err) {
      console.error(
        'Failed to sync Green Member status on product creation:',
        err,
      )
    }

    return product
  }

  async updateProduct(id: string, data: any, userId?: string, role?: string) {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) throw new Error('Product not found')

    if (userId && role && product.userId !== userId && role !== 'admin') {
      throw new Error('Forbidden: You do not own this listing')
    }

    const { location, ...cleanUpdateData } = data
    if (!cleanUpdateData.city && location) {
      cleanUpdateData.city = location
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...cleanUpdateData,
        price: data.price ? parseFloat(data.price) : undefined,
      },
    })

    // Invalidate product caches and categories count cache
    await Promise.all([
      cacheDel([
        CACHE_KEYS.PRODUCT_DETAIL(id),
        CACHE_KEYS.PRODUCTS_RECENT,
        CACHE_KEYS.CATEGORIES_ALL,
      ]),
      cacheDelPattern(CACHE_KEYS.PRODUCTS_LIST_PATTERN),
    ])

    // Dispatch background image optimization for newly updated images
    if (updatedProduct.images && updatedProduct.images.length > 0) {
      try {
        await imageQueue.add(JOB_NAMES.IMAGE.OPTIMIZE_IMAGE, {
          entityId: updatedProduct.id,
          entityType: 'product',
          imageUrls: updatedProduct.images,
        })
      } catch (err) {
        console.error(
          'Failed to queue product image optimization on update:',
          err,
        )
      }
    }

    return updatedProduct
  }

  async deleteProduct(id: string, userId?: string, role?: string) {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) throw new Error('Product not found')

    const isCreator = userId && product.userId === userId
    const isAdmin = role === 'admin'

    if (!isCreator && !isAdmin) {
      throw new Error('Forbidden: You do not own this listing')
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        const publicId = cloudinaryService.extractPublicId(imageUrl)
        if (publicId) {
          await cloudinaryService.deleteImage(publicId, product.userId)
        }
      }
    }

    // Delete associated rentals (which cascades to disputes)
    await prisma.rental.deleteMany({ where: { productId: id } })

    const deletedProduct = await prisma.product.delete({ where: { id } })

    // Invalidate product caches and categories count cache
    await Promise.all([
      cacheDel([
        CACHE_KEYS.PRODUCT_DETAIL(id),
        CACHE_KEYS.PRODUCTS_RECENT,
        CACHE_KEYS.CATEGORIES_ALL,
      ]),
      cacheDelPattern(CACHE_KEYS.PRODUCTS_LIST_PATTERN),
    ])

    try {
      await syncGreenMemberStatus(product.userId)
    } catch (err) {
      console.error(
        'Failed to sync Green Member status on product deletion:',
        err,
      )
    }

    return deletedProduct
  }

  async toggleAvailability(id: string, isAvailable: boolean) {
    const product = await prisma.product.update({
      where: { id },
      data: { isAvailable },
    })

    // Invalidate product caches
    await Promise.all([
      cacheDel([CACHE_KEYS.PRODUCT_DETAIL(id), CACHE_KEYS.PRODUCTS_RECENT]),
      cacheDelPattern(CACHE_KEYS.PRODUCTS_LIST_PATTERN),
    ])

    return product
  }

  async getUserListings(userId: string) {
    const products = await prisma.product.findMany({
      where: { userId },
      include: {
        category: true,
        reviews: { select: { rating: true } },
        rentals: { select: { id: true, totalPrice: true, status: true } },
        _count: { select: { reviews: true, rentals: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return products.map((p: any) => {
      const bookingsCount = p._count?.rentals || 0
      const reviewsCount = p._count?.reviews || 0
      const rating =
        p.reviews && p.reviews.length > 0
          ? (
              p.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
              p.reviews.length
            ).toFixed(1)
          : '0.0'
      const earnings = p.rentals
        ? p.rentals
            .filter(
              (r: any) =>
                r.status === 'completed' ||
                r.status === 'confirmed' ||
                r.status === 'in_use' ||
                r.status === 'returned',
            )
            .reduce((sum: number, r: any) => sum + (r.totalPrice || 0), 0)
        : 0

      return {
        ...p,
        views: p.views || 0,
        bookingsCount,
        reviewsCount,
        rating,
        earnings,
      }
    })
  }
  async setFeaturedProduct(id: string) {
    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) throw new Error('Product not found')

    // If it's already featured, just unfeature it (toggle off)
    if (product.isFeatured) {
      await prisma.product.update({
        where: { id },
        data: { isFeatured: false },
      })
    } else {
      // Otherwise, unfeature all, then feature the requested one
      await prisma.$transaction([
        prisma.product.updateMany({
          where: { isFeatured: true },
          data: { isFeatured: false },
        }),
        prisma.product.update({
          where: { id },
          data: { isFeatured: true },
        }),
      ])
    }

    // Invalidate product list cache so hero section re-fetches
    await cacheDelPattern(CACHE_KEYS.PRODUCTS_LIST_PATTERN)
    await cacheDel([CACHE_KEYS.PRODUCT_DETAIL(id)])

    return { success: true }
  }
}

export const productService = new ProductService()
