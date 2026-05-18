import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../config/prisma.js";
import { auth } from "../config/auth.js";

export class CategoryRequestController {
  async getAllRequests(request: FastifyRequest, reply: FastifyReply) {
    const requests = await prisma.categoryRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    return { requests };
  }

  async createRequest(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const { name, icon, color, image } = request.body as any;
    if (!name) {
      return reply.status(400).send({ message: "Category name is required" });
    }

    const categoryRequest = await prisma.categoryRequest.create({
      data: {
        name,
        icon,
        color,
        image,
        ownerId: session.user.id,
        status: "pending"
      }
    });

    // Create system notification for admins
    await prisma.notification.create({
      data: {
        userId: session.user.id, // For activity logs
        title: "New Category Request",
        message: `Owner ${session.user.name || session.user.email} requested new category "${name}"`,
        type: "alert"
      }
    });

    return { categoryRequest };
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const { status, reason } = request.body as any;

    if (!["approved", "rejected"].includes(status)) {
      return reply.status(400).send({ message: "Invalid status" });
    }

    const categoryReq = await prisma.categoryRequest.findUnique({
      where: { id }
    });

    if (!categoryReq) {
      return reply.status(404).send({ message: "Category request not found" });
    }

    const updated = await prisma.categoryRequest.update({
      where: { id },
      data: { status, reason }
    });

    if (status === "approved") {
      // Create actual Category
      await prisma.category.create({
        data: {
          name: categoryReq.name,
          icon: categoryReq.icon,
          color: categoryReq.color,
          image: categoryReq.image
        }
      });

      // Notify the requesting Owner
      await prisma.notification.create({
        data: {
          userId: categoryReq.ownerId,
          title: "Category Request Approved",
          message: `Your request to add category "${categoryReq.name}" has been approved!`,
          type: "booking"
        }
      });
    } else {
      // Notify Owner of Rejection
      await prisma.notification.create({
        data: {
          userId: categoryReq.ownerId,
          title: "Category Request Rejected",
          message: `Your request for "${categoryReq.name}" was rejected. Reason: ${reason || "Not specified."}`,
          type: "alert"
        }
      });
    }

    return { success: true, request: updated };
  }
}

export const categoryRequestController = new CategoryRequestController();
