import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../config/prisma.js";
import { auth } from "../config/auth.js";

export class NotificationController {
  async getNotifications(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    });

    return { notifications };
  }

  async markAsRead(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const updated = await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { isRead: true }
    });

    return { success: true, count: updated.count };
  }

  async markAllAsRead(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const updated = await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true }
    });

    return { success: true, count: updated.count };
  }
}

export const notificationController = new NotificationController();
