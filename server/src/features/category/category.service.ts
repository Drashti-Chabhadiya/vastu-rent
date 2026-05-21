import { prisma } from "../../config/prisma.js";

export class CategoryService {
  async getAllCategories() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async createCategory(data: { name: string; icon?: string; color?: string; image?: string }) {
    return prisma.category.create({
      data,
    });
  }

  async updateCategory(id: string, data: { name: string; icon?: string; color?: string; image?: string }) {
    return prisma.category.update({
      where: { id },
      data,
    });
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
    return prisma.category.delete({ where: { id } });
  }
}

export const categoryService = new CategoryService();
