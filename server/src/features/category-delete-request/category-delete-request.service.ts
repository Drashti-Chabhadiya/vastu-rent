import { prisma } from "../../config/prisma.js";
import { categoryService } from "../category/category.service.js";

export class CategoryDeleteRequestService {
  async createRequest(categoryId: string, userId: string, reason?: string) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new Error("Category not found");

    if (category.userId !== userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== "admin") {
        throw new Error("Forbidden: You can only delete categories you proposed");
      }
    }

    // Check if a pending request already exists
    const existingRequest = await prisma.deleteCategoryRequest.findFirst({
      where: { categoryId, status: "pending" },
    });
    if (existingRequest) throw new Error("A deletion request is already pending for this category");

    // Check if an unexpired approved request already exists
    const activeApprovedRequest = await prisma.deleteCategoryRequest.findFirst({
      where: { categoryId, status: "approved" },
    });

    if (activeApprovedRequest && activeApprovedRequest.approvedAt) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (activeApprovedRequest.approvedAt >= oneDayAgo) {
        throw new Error("A deletion request for this category is already approved and active. Please delete it in the pipeline.");
      }
    }

    return prisma.deleteCategoryRequest.create({
      data: {
        categoryId,
        userId,
        reason,
        status: "pending",
        categoryName: category.name,
        categoryIcon: category.icon,
        categoryColor: category.color,
      },
      include: {
        category: true,
        user: { select: { name: true, email: true } },
      },
    });
  }

  async getAllRequests(userId: string, role: string) {
    const isAdmin = role === "admin";
    const requests = await prisma.deleteCategoryRequest.findMany({
      where: isAdmin ? {} : { userId },
      include: {
        category: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!isAdmin) {
      return requests;
    }

    return Promise.all(
      requests.map(async (req) => {
        if (!req.categoryId) {
          return {
            ...req,
            productsCount: 0,
            listingsUsersCount: 0,
            rentalsCount: 0,
            distinctRentersCount: 0,
            sampleProducts: [],
          };
        }

        const [productsCount, listingsUsers, rentalsCount, renters, sampleProducts] = await Promise.all([
          prisma.product.count({ where: { categoryId: req.categoryId } }),
          prisma.product.groupBy({
            by: ["userId"],
            where: { categoryId: req.categoryId },
          }),
          prisma.rental.count({
            where: { product: { categoryId: req.categoryId } },
          }),
          prisma.rental.groupBy({
            by: ["renterId"],
            where: { product: { categoryId: req.categoryId } },
          }),
          prisma.product.findMany({
            where: { categoryId: req.categoryId },
            take: 5,
            select: {
              id: true,
              title: true,
              price: true,
              user: { select: { name: true, email: true } },
            },
          }),
        ]);

        return {
          ...req,
          productsCount,
          listingsUsersCount: listingsUsers.length,
          rentalsCount,
          distinctRentersCount: renters.length,
          sampleProducts,
        };
      })
    );
  }

  async updateRequestStatus(requestId: string, status: "approved" | "rejected", adminId: string) {
    const request = await prisma.deleteCategoryRequest.findUnique({
      where: { id: requestId },
      include: { category: true },
    });

    if (!request) throw new Error("Request not found");
    if (request.status !== "pending") throw new Error("Request is already processed");

    if (status === "approved") {
      if (!request.categoryId) {
        throw new Error("Category is already deleted or not linked to this request");
      }

      // Update status to approved and set approval timestamp
      return prisma.deleteCategoryRequest.update({
        where: { id: requestId },
        data: { 
          status: "approved",
          approvedAt: new Date(),
        },
      });
    } else {
      return prisma.deleteCategoryRequest.update({
        where: { id: requestId },
        data: { status: "rejected" },
      });
    }
  }

  async verifyDeletePermission(categoryId: string, userId: string, role: string): Promise<boolean> {
    if (role === "admin") return true;

    const request = await prisma.deleteCategoryRequest.findFirst({
      where: {
        categoryId,
        userId,
        status: "approved",
      },
    });

    if (!request || !request.approvedAt) return false;

    // 24 hours validity window
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return request.approvedAt >= oneDayAgo;
  }
}

export const categoryDeleteRequestService = new CategoryDeleteRequestService();
