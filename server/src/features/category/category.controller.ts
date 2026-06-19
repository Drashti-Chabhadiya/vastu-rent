import { FastifyRequest, FastifyReply } from "fastify";
import { categoryService } from "./category.service.js";
import { prisma } from "../../config/prisma.js";
import { createAndDeliverNotification, notifyAllAdmins } from "../../lib/notification.js";

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

  async deleteCategory(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;

    // Retrieve category details before deletion to get name and proposer ID
    const category = await prisma.category.findUnique({
      where: { id },
      select: { name: true, userId: true },
    });

    // Find the approved deletion request for this category
    const deleteRequest = await prisma.deleteCategoryRequest.findFirst({
      where: {
        categoryId: id,
        status: "approved",
      },
    });

    const categoryName = category?.name || deleteRequest?.categoryName || "Unknown Category";
    const proposerId = category?.userId || deleteRequest?.userId;

    await categoryService.deleteCategory(id);

    // If there was an approved delete request, update its status to "deleted"
    if (deleteRequest) {
      await prisma.deleteCategoryRequest.update({
        where: { id: deleteRequest.id },
        data: { status: "deleted" },
      });
    }

    // Deliver notifications
    try {
      const currentUser = (request as any).user;

      // Notify proposer
      if (proposerId && proposerId === currentUser?.id) {
        await createAndDeliverNotification({
          userId: proposerId,
          title: "Category Deleted",
          message: `The category "${categoryName}" has been successfully deleted.`,
          type: "info",
          url: "/dashboard/categories?tab=requests&sub=deletions",
        });
      } else if (proposerId) {
        await createAndDeliverNotification({
          userId: proposerId,
          title: "Category Deleted",
          message: `The category "${categoryName}" has been deleted by an administrator.`,
          type: "alert",
          url: "/dashboard/categories?tab=requests&sub=deletions",
        });
      }

      // Notify all admins
      await notifyAllAdmins({
        title: "Category Deleted",
        message: `User ${currentUser?.name || currentUser?.email || 'Unknown'} deleted category "${categoryName}".`,
        type: "info",
        url: "/admin/dashboard/categories?tab=requests&sub=deletions",
      });
    } catch (err) {
      console.error("Failed to send category deleted notification:", err);
    }

    return { success: true };
  }
}

export const categoryController = new CategoryController();
