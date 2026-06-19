import { prisma } from "../../config/prisma.js";
import { cacheGet, cacheSet, cacheDel } from "../../lib/redis-cache.js";
import { CACHE_KEYS, CACHE_TTLS } from "../../constants/cache-keys.js";

export class CategoryService {
  async getAllCategories() {
    // Try to get categories from Redis cache
    const cachedCategories = await cacheGet<any[]>(CACHE_KEYS.CATEGORIES_ALL);
    if (cachedCategories) {
      return cachedCategories;
    }

    // Fetch from database if cache miss
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    // Save to Redis cache
    await cacheSet(CACHE_KEYS.CATEGORIES_ALL, categories, CACHE_TTLS.CATEGORIES);

    return categories;
  }

  async createCategory(data: { name: string; icon?: string; color?: string; image?: string }) {
    const category = await prisma.category.create({
      data,
    });

    // Invalidate categories cache
    await cacheDel(CACHE_KEYS.CATEGORIES_ALL);

    return category;
  }

  async updateCategory(id: string, data: { name: string; icon?: string; color?: string; image?: string }) {
    const category = await prisma.category.update({
      where: { id },
      data,
    });

    // Invalidate categories cache
    await cacheDel(CACHE_KEYS.CATEGORIES_ALL);

    return category;
  }

  async deleteCategory(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (category?.image) {
      const { cloudinaryService } = await import("../upload/cloudinary.service.js");
      const publicId = cloudinaryService.extractPublicId(category.image);
      if (publicId) {
        await cloudinaryService.deleteImage(publicId);
      }
    }

    const deletedCategory = await prisma.category.delete({ where: { id } });

    // Invalidate categories cache
    await cacheDel(CACHE_KEYS.CATEGORIES_ALL);

    return deletedCategory;
  }
}

export const categoryService = new CategoryService();
