import { FastifyRequest, FastifyReply } from "fastify";
import { categoryService } from "./category.service.js";
import { prisma } from "../../config/prisma.js";

export class CategoryController {
  async getAllCategories(_request: FastifyRequest, _reply: FastifyReply) {
    const categories = await categoryService.getAllCategories();
    return { categories };
  }

  async createCategory(request: FastifyRequest, _reply: FastifyReply) {
    const data = request.body as any;
    const category = await categoryService.createCategory(data);
    return { category };
  }

  async updateCategory(request: FastifyRequest, _reply: FastifyReply) {
    const { id } = request.params as any;
    const data = request.body as any;
    const category = await categoryService.updateCategory(id, data);
    return { category };
  }

  async deleteCategory(request: FastifyRequest, _reply: FastifyReply) {
    const { id } = request.params as any;

    // Find the approved deletion request for this category
    const deleteRequest = await prisma.deleteCategoryRequest.findFirst({
      where: {
        categoryId: id,
        status: "approved",
      },
    });

    await categoryService.deleteCategory(id);

    // If there was an approved delete request, update its status to "deleted"
    if (deleteRequest) {
      await prisma.deleteCategoryRequest.update({
        where: { id: deleteRequest.id },
        data: { status: "deleted" },
      });
    }

    return { success: true };
  }
}

export const categoryController = new CategoryController();
