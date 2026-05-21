import { prisma } from "../../config/prisma.js";
import { productService } from "../product/product.service.js";

export class DeleteRequestService {
  async createRequest(productId: string, adminId: string, reason?: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Product not found");

    // Check if a pending request already exists
    const existingRequest = await prisma.deleteProductRequest.findFirst({
      where: { productId, status: "pending" },
    });
    if (existingRequest) throw new Error("A deletion request is already pending for this product");

    return prisma.deleteProductRequest.create({
      data: {
        productId,
        adminId,
        reason,
        status: "pending",
      },
      include: {
        product: true,
        admin: { select: { name: true, email: true } },
      },
    });
  }

  async getAllRequests() {
    return prisma.deleteProductRequest.findMany({
      include: {
        product: {
          include: {
            owner: { select: { name: true, email: true } }
          }
        },
        admin: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateRequestStatus(requestId: string, status: "approved" | "rejected", superAdminId: string) {
    const request = await prisma.deleteProductRequest.findUnique({
      where: { id: requestId },
      include: { product: true },
    });

    if (!request) throw new Error("Request not found");
    if (request.status !== "pending") throw new Error("Request is already processed");

    if (status === "approved") {
      // Delete the product
      await productService.deleteProduct(request.productId, superAdminId, "superAdmin");
      
      // Update request status
      return prisma.deleteProductRequest.update({
        where: { id: requestId },
        data: { status: "approved" },
      });
    } else {
      return prisma.deleteProductRequest.update({
        where: { id: requestId },
        data: { status: "rejected" },
      });
    }
  }

  async getMyRequests(adminId: string) {
    return prisma.deleteProductRequest.findMany({
      where: { adminId },
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const deleteRequestService = new DeleteRequestService();
