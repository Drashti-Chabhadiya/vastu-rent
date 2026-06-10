import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../config/prisma.js";
import { auth } from "../../config/auth.js";

export class CategoryRequestController {
  async getAllRequests(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const { role, id: userId } = session.user;
    const isSearchAdmin = role === 'admin';

    const requests = await prisma.categoryRequest.findMany({
      where: isSearchAdmin ? {} : { userId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
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

    const { name, icon, color, image, description, requestReason } = request.body as any;
    if (!name) {
      return reply.status(400).send({ message: "Category name is required" });
    }

    const categoryRequest = await prisma.categoryRequest.create({
      data: {
        name,
        icon,
        color,
        image,
        description,
        requestReason,
        userId: session.user.id,
        status: "pending"
      }
    });

    // Create system notification for admins (and persist + deliver)
    try {
      const { createAndDeliverNotification } = await import('../../lib/notification.js')
      await createAndDeliverNotification({
        userId: session.user.id,
        title: 'New Category Request',
        message: `User ${session.user.name || session.user.email} requested new category "${name}"`,
        type: 'alert',
      })
    } catch (err) {
      console.error('Failed to deliver category-request notification:', err)
    }

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

      // Notify the requesting User
      try {
        const { createAndDeliverNotification } = await import('../../lib/notification.js')
        await createAndDeliverNotification({
          userId: categoryReq.userId,
          title: 'Category Request Approved',
          message: `Your request to add category "${categoryReq.name}" has been approved!`,
          type: 'booking',
        })
      } catch (err) {
        console.error('Failed to deliver approval notification:', err)
      }
    } else {
      // Notify User of Rejection
      try {
        const { createAndDeliverNotification } = await import('../../lib/notification.js')
        await createAndDeliverNotification({
          userId: categoryReq.userId,
          title: 'Category Request Rejected',
          message: `Your request for "${categoryReq.name}" was rejected. Reason: ${reason || 'Not specified.'}`,
          type: 'alert',
        })
      } catch (err) {
        console.error('Failed to deliver rejection notification:', err)
      }
    }

    return { success: true, request: updated };
  }
}

export const categoryRequestController = new CategoryRequestController();
