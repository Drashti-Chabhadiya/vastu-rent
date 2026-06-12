import { FastifyRequest, FastifyReply } from "fastify";
import { userService } from "./user.service.js";
import { auth } from "../../config/auth.js";
import { isAdminRole, isDashboardRole } from "../../config/roles.js";

export class UserController {
  async getRecentUsers(_request: FastifyRequest, _reply: FastifyReply) {
    const users = await userService.getRecentUsers();
    return { users };
  }

  async getAllUsers(request: FastifyRequest, _reply: FastifyReply) {
    const users = await userService.getAllUsers(request.query as any);
    const { isUserOnline } = await import("../../lib/socket.js");
    const usersWithOnlineStatus = users.map((u: any) => {
      const showOnline = u.showOnline !== false;
      return {
        ...u,
        isOnline: showOnline ? isUserOnline(u.id) : false,
      };
    });
    return { users: usersWithOnlineStatus };
  }

  async banUser(request: FastifyRequest, _reply: FastifyReply) {
    const { id } = request.params as any;
    const { banned, reason } = request.body as any;
    const user = await userService.banUser(id, banned, reason);
    return { user };
  }

  async updateUserRole(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any as any });
    if (!isAdminRole(session?.user.role)) {
      return reply.status(403).send({ message: "Forbidden: Admin access required" });
    }

    const { id } = request.params as any;
    const { role } = request.body as any;
    const user = await userService.updateUserRole(id, role);
    return { user };
  }

  async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any as any });
    if (!isAdminRole(session?.user.role)) {
      return reply.status(403).send({ message: "Forbidden: Admin access required" });
    }

    const { id } = request.params as any;
    await userService.deleteUser(id);
    return { success: true };
  }

  async getPublicProfile(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const session = await auth.api.getSession({ headers: request.headers as any });
    const profile = await userService.getPublicProfile(id);
    if (!profile) return reply.status(404).send({ message: "Profile not found" });

    const isOwner = session?.user?.id === id;
    if (profile.showProfile === false && !isOwner) {
      profile.image = null;
    }

    // Apply reciprocal check for showOnline / lastActive
    const loggedInUserShowOnline = session ? (session.user as any).showOnline !== false : false;
    const otherUserShowOnline = (profile as any).showOnline !== false;
    const canSeeStatus = isOwner || (loggedInUserShowOnline && otherUserShowOnline);

    const { isUserOnline } = await import("../../lib/socket.js");
    (profile as any).isOnline = canSeeStatus ? isUserOnline(id) : false;
    if (!canSeeStatus) {
      (profile as any).lastActive = null;
    }

    // Lazy sync Green Member status on profile load to ensure accuracy
    try {
      const { syncGreenMemberStatus } = await import("../../lib/green-member.helper.js");
      const isGreen = await syncGreenMemberStatus(id);
      (profile as any).isGreenMember = isGreen;
    } catch (err) {
      console.error("Failed to sync Green Member status in getPublicProfile:", err);
    }

    return profile;
  }

  async updateSettings(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });

    try {
      const body = request.body as any;
      const user = await userService.updateUserSettings(session.user.id, body);

      // If showOnline was updated, broadcast presence update to other clients if user is online
      if (body.showOnline !== undefined) {
        try {
          const { io, isUserOnline } = await import("../../lib/socket.js");
          if (isUserOnline(session.user.id)) {
            if (body.showOnline === false) {
              io?.emit("user_status", { userId: session.user.id, status: "offline" });
            } else {
              io?.emit("user_status", { userId: session.user.id, status: "online" });
            }
          }
        } catch (err) {
          console.error("Failed to broadcast presence update after settings change:", err);
        }
      }

      return { user };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Failed to update settings" });
    }
  }

  async getCloudinaryConfig(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });

    const role = session.user.role;
    if (!isDashboardRole(role)) {
      return reply.status(403).send({ message: "Forbidden: Dashboard role required" });
    }

    try {
      const config = await userService.getCloudinaryConfig(session.user.id);
      return { config };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Failed to get settings" });
    }
  }

  async saveCloudinaryConfig(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });

    const role = session.user.role;
    if (!isDashboardRole(role)) {
      return reply.status(403).send({ message: "Forbidden: Dashboard role required" });
    }

    try {
      const config = await userService.saveCloudinaryConfig(session.user.id, request.body as any);
      return { success: true, config };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Failed to save settings" });
    }
  }

  async testCloudinaryConfig(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });

    const role = session.user.role;
    if (!isDashboardRole(role)) {
      return reply.status(403).send({ message: "Forbidden: Dashboard role required" });
    }

    const testCloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const testApiKey = process.env.CLOUDINARY_API_KEY;
    const testApiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!testCloudName || !testApiKey || !testApiSecret) {
      return reply.status(400).send({ message: "Cloudinary is not configured in environment variables (.env)" });
    }

    try {
      const { v2: cloudinary } = await import("cloudinary");
      
      const pingResult = await cloudinary.api.ping({
        cloud_name: testCloudName,
        api_key: testApiKey,
        api_secret: testApiSecret
      });

      return { success: true, message: "Connection successful!", result: pingResult };
    } catch (error: any) {
      console.error("Cloudinary test failed:", error);
      return reply.status(400).send({ message: error.message || "Failed to connect to Cloudinary" });
    }
  }

  async getCloudinaryUsage(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });

    const role = session.user.role;
    if (!isDashboardRole(role)) {
      return reply.status(403).send({ message: "Forbidden: Dashboard role required" });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

    if (!cloudName || !apiKey || !apiSecret) {
      return { 
        hasConfig: false, 
        storage: { usage: 0, limit: 10485760000, used_percent: 0 } // 10 GB default placeholder
      };
    }

    try {
      const { v2: cloudinary } = await import("cloudinary");
      const usageResult = await cloudinary.api.usage({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
      });

      return {
        hasConfig: true,
        cloudName,
        storage: {
          usage: usageResult.storage?.usage || 0,
          limit: usageResult.storage?.limit || 10485760000,
          used_percent: usageResult.storage?.used_percent || 0
        },
        credits: {
          usage: usageResult.credits?.usage || 0,
          limit: usageResult.credits?.limit || 25,
          used_percent: usageResult.credits?.used_percent || 0
        }
      };
    } catch (error: any) {
      console.error("Cloudinary usage API failed:", error);
      return { 
        hasConfig: false, 
        message: error.message || "Failed to fetch Cloudinary usage",
        storage: { usage: 0, limit: 10485760000, used_percent: 0 }
      };
    }
  }

  async getSessions(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });

    try {
      const { prisma } = await import("../../config/prisma.js");
      const sessions = await prisma.session.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });
      return { sessions };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Failed to fetch sessions" });
    }
  }

  async revokeSession(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });

    const { id } = request.params as any;

    try {
      const { prisma } = await import("../../config/prisma.js");
      const targetSession = await prisma.session.findUnique({
        where: { id },
      });

      if (!targetSession || targetSession.userId !== session.user.id) {
        return reply.status(404).send({ message: "Session not found" });
      }

      await prisma.session.delete({
        where: { id },
      });

      return { success: true };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Failed to revoke session" });
    }
  }

  async renameSession(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });

    const { id } = request.params as any;
    const { deviceName } = request.body as any;

    try {
      const { prisma } = await import("../../config/prisma.js");
      const targetSession = await prisma.session.findUnique({
        where: { id },
      });

      if (!targetSession || targetSession.userId !== session.user.id) {
        return reply.status(404).send({ message: "Session not found" });
      }

      const updated = await prisma.session.update({
        where: { id },
        data: {
          deviceName: deviceName || null,
        },
      });

      return { success: true, session: updated };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Failed to rename device" });
    }
  }

  async getRecentSearches(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });

    try {
      const searches = await userService.getRecentSearches(session.user.id);
      return { searches };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Failed to fetch searches" });
    }
  }

  async saveRecentSearch(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });

    const { query } = request.body as any;
    if (!query) {
      return reply.status(400).send({ message: "Query parameter is required" });
    }

    try {
      const searches = await userService.saveRecentSearch(session.user.id, query);
      return { success: true, searches };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Failed to save search" });
    }
  }

  async deleteRecentSearch(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });

    const { id } = request.params as any;

    try {
      await userService.deleteRecentSearch(session.user.id, id);
      return { success: true };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Failed to delete search" });
    }
  }

  async clearRecentSearches(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });

    try {
      await userService.clearRecentSearches(session.user.id);
      return { success: true };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Failed to clear searches" });
    }
  }
}

export const userController = new UserController();
