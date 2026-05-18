import { FastifyRequest, FastifyReply } from "fastify";
import { userService } from "../services/user.service.js";
import { auth } from "../config/auth.js";

export class UserController {
  async getRecentUsers(request: FastifyRequest, reply: FastifyReply) {
    const users = await userService.getRecentUsers();
    return { users };
  }

  async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    const users = await userService.getAllUsers(request.query as any);
    return { users };
  }

  async banUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const { banned, reason } = request.body as any;
    const user = await userService.banUser(id, banned, reason);
    return { user };
  }

  async updateUserRole(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any as any });
    if (session?.user.role !== "superAdmin") {
      return reply.status(403).send({ message: "Forbidden: Super Admin access required" });
    }

    const { id } = request.params as any;
    const { role } = request.body as any;
    const user = await userService.updateUserRole(id, role);
    return { user };
  }

  async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any as any });
    if (session?.user.role !== "superAdmin") {
      return reply.status(403).send({ message: "Forbidden: Super Admin access required" });
    }

    const { id } = request.params as any;
    await userService.deleteUser(id);
    return { success: true };
  }

  async getPublicProfile(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const profile = await userService.getPublicProfile(id);
    if (!profile) return reply.status(404).send({ message: "Profile not found" });
    return profile;
  }

  async updateSettings(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });

    try {
      const user = await userService.updateUserSettings(session.user.id, request.body as any);
      return { user };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Failed to update settings" });
    }
  }
}

export const userController = new UserController();
