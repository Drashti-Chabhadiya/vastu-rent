import { FastifyInstance } from "fastify";
import { productController } from "./product.controller.js";
import { auth } from "../../config/auth.js";
import { prisma } from "../../config/prisma.js";

export async function productRoutes(fastify: FastifyInstance) {
  // ─── Public Routes ──────────────────────────────────────────────────────────
  fastify.get("/", productController.getAllProducts);
  fastify.get("/recent", productController.getRecentProducts);
  fastify.get("/:id", productController.getProductById);

  // ─── Protected Routes (Requires Login) ──────────────────────────────────────
  const authHandler = async (request: any, reply: any) => {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session) return reply.status(401).send({ message: "Unauthorized" });
    request.user = session.user;
  };

  const ownerOrAdmin = async (request: any, reply: any) => {
    await authHandler(request, reply);
    const role = request.user.role;
    if (role !== "owner" && role !== "admin" && role !== "superAdmin") {
      return reply.status(403).send({ message: "Forbidden: Owner access required" });
    }
  };

  // Owner/Admin Management
  fastify.post("/", { preHandler: [ownerOrAdmin] }, productController.createProduct);
  fastify.get("/my-listings", { preHandler: [ownerOrAdmin] }, productController.getMyListings);
  fastify.put("/:id", { preHandler: [ownerOrAdmin] }, productController.updateProduct);
  fastify.delete("/:id", { preHandler: [ownerOrAdmin] }, productController.deleteProduct);
  
  // Toggle product availability (Owner of the product, or Admin/SuperAdmin)
  fastify.post("/:id/available", {
    preHandler: async (request: any, reply: any) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session) return reply.status(401).send({ message: "Unauthorized" });

      const role = session.user.role;
      const { id } = request.params as any;

      if (role === "admin" || role === "superAdmin") {
        request.user = session.user;
        return;
      }

      if (role === "owner") {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) return reply.status(404).send({ message: "Product not found" });
        if (product.ownerId !== session.user.id) {
          return reply.status(403).send({ message: "Forbidden: You do not own this listing" });
        }
        request.user = session.user;
        return;
      }

      return reply.status(403).send({ message: "Forbidden: Owner or Admin access required" });
    }
  }, productController.toggleAvailability);
}
