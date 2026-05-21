import { FastifyRequest, FastifyReply } from "fastify";
import { userService } from "./user.service.js";
import { auth } from "../../config/auth.js";

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

  async getCloudinaryConfig(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });

    const role = session.user.role;
    if (role !== "owner" && role !== "admin" && role !== "superAdmin") {
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
    if (role !== "owner" && role !== "admin" && role !== "superAdmin") {
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
    if (role !== "owner" && role !== "admin" && role !== "superAdmin") {
      return reply.status(403).send({ message: "Forbidden: Dashboard role required" });
    }

    const { cloudName, apiKey, apiSecret } = request.body as any;

    let testCloudName = cloudName;
    let testApiKey = apiKey;
    let testApiSecret = apiSecret;

    const { prisma } = await import("../../config/prisma.js");

    if (!testApiSecret) {
      const config = await prisma.cloudinaryConfig.findUnique({
        where: { userId: session.user.id }
      });
      if (config) {
        const { decrypt } = await import("../../config/encryption.js");
        testApiSecret = decrypt(config.apiSecret);
        if (!testCloudName) testCloudName = config.cloudName;
        if (!testApiKey) testApiKey = config.apiKey;
      }
    }

    if (!testCloudName || !testApiKey || !testApiSecret) {
      return reply.status(400).send({ message: "Missing Cloudinary configuration parameters" });
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
    if (role !== "owner" && role !== "admin" && role !== "superAdmin") {
      return reply.status(403).send({ message: "Forbidden: Dashboard role required" });
    }

    const { prisma } = await import("../../config/prisma.js");
    const config = await prisma.cloudinaryConfig.findUnique({
      where: { userId: session.user.id }
    });

    let cloudName = config?.cloudName || process.env.CLOUDINARY_CLOUD_NAME;
    let apiKey = config?.apiKey || process.env.CLOUDINARY_API_KEY;
    let apiSecret = "";

    if (config) {
      const { decrypt } = await import("../../config/encryption.js");
      try {
        apiSecret = decrypt(config.apiSecret);
      } catch (err) {
        console.error("Failed to decrypt API Secret for usage tracking:", err);
      }
    } else {
      apiSecret = process.env.CLOUDINARY_API_SECRET || "";
    }

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
}

export const userController = new UserController();
