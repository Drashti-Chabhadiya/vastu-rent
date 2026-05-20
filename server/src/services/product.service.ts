import { prisma } from "../config/prisma.js";

export class ProductService {
  async getAllProducts(filters: { search?: string; categoryId?: string; status?: string; minPrice?: string; maxPrice?: string; isAvailable?: boolean; ids?: string | string[] }) {
    const { search, categoryId, status, minPrice, maxPrice, isAvailable, ids } = filters;
    const where: any = {};

    if (ids) {
      const idArray = Array.isArray(ids) ? ids : ids.split(',');
      where.id = { in: idArray };
    }

    if (isAvailable !== undefined) where.isAvailable = isAvailable;
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (status === 'available') where.isAvailable = true;
    if (status === 'unavailable') where.isAvailable = false;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        owner: {
          select: { id: true, name: true, email: true, image: true },
        },
        reviews: {
          select: { rating: true }
        },
        _count: {
          select: { reviews: true }
        }
      },
    });

    return products.map((p: any) => ({
      ...p,
      reviewsCount: p._count.reviews,
      rating: p.reviews.length > 0 
        ? (p.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / p.reviews.length).toFixed(1)
        : "5.0"
    }));
  }

  async getRecentProducts() {
    return prisma.product.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        owner: { select: { name: true } },
      },
    });
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        owner: { 
          include: {
            products: {
              include: {
                reviews: {
                  select: { rating: true }
                }
              }
            },
            _count: {
              select: { products: true }
            }
          } 
        },
        reviews: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: { reviews: true }
        }
      },
    });

    if (!product) return null;

    // Calculate owner's average rating
    let ownerTotalRating = 0;
    let ownerReviewCount = 0;
    product.owner.products.forEach((p: any) => {
      p.reviews.forEach((r: any) => {
        ownerTotalRating += r.rating;
        ownerReviewCount++;
      });
    });
    const ownerRating = ownerReviewCount > 0 ? (ownerTotalRating / ownerReviewCount).toFixed(1) : "5.0";

    return {
      ...product,
      reviewsCount: product._count.reviews,
      rating: product.reviews.length > 0 
        ? (product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
        : "5.0",
      owner: {
        id: product.owner.id,
        name: product.owner.name,
        image: product.owner.image,
        createdAt: product.owner.createdAt,
        rating: ownerRating,
        listingsCount: product.owner._count.products
      }
    };
  }

  async createProduct(data: any) {
    return prisma.product.create({
      data: {
        ...data,
        price: parseFloat(data.price),
        securityDeposit: data.securityDeposit ? parseFloat(data.securityDeposit) : 0,
        images: data.images || [],
        isAvailable: true,
      },
    });
  }

  async updateProduct(id: string, data: any, userId?: string, role?: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error("Product not found");

    if (userId && role && product.ownerId !== userId && role !== "admin" && role !== "superAdmin") {
      throw new Error("Forbidden: You do not own this listing");
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
      },
    });
  }

  async deleteProduct(id: string, userId?: string, role?: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error("Product not found");

    const isOwner = userId && product.ownerId === userId;
    const isSuperAdmin = role === "superAdmin";
    const isAdmin = role === "admin";

    if (!isOwner && !isSuperAdmin) {
      if (isAdmin) {
        throw new Error("Forbidden: Admin must request SuperAdmin approval to delete products they do not own");
      }
      throw new Error("Forbidden: You do not own this listing");
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const { cloudinaryService } = await import("./cloudinary.service.js");
      for (const imageUrl of product.images) {
        const publicId = cloudinaryService.extractPublicId(imageUrl);
        if (publicId) {
          await cloudinaryService.deleteImage(publicId, product.ownerId);
        }
      }
    }

    return prisma.product.delete({ where: { id } });
  }

  async toggleAvailability(id: string, isAvailable: boolean) {
    return prisma.product.update({
      where: { id },
      data: { isAvailable },
    });
  }

  async getOwnerListings(ownerId: string) {
    return prisma.product.findMany({
      where: { ownerId },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const productService = new ProductService();
