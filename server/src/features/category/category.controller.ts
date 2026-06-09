import { FastifyRequest, FastifyReply } from "fastify";
import { categoryService } from "./category.service.js";

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
    await categoryService.deleteCategory(id);
    return { success: true };
  }
}

export const categoryController = new CategoryController();
