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

  // User/Admin Management
  fastify.post("/", { preHandler: [authHandler] }, productController.createProduct);
  fastify.get("/my-listings", { preHandler: [authHandler] }, productController.getMyListings);
  fastify.put("/:id", { preHandler: [authHandler] }, productController.updateProduct);
  fastify.delete("/:id", { preHandler: [authHandler] }, productController.deleteProduct);

  // Toggle product availability (Creator of the product, or Admin)
  fastify.post("/:id/available", {
    preHandler: async (request: any, reply: any) => {
      const session = await auth.api.getSession({ headers: request.headers as any });
      if (!session) return reply.status(401).send({ message: "Unauthorized" });

      const role = session.user.role;
      const { id } = request.params as any;

      if (role === "admin") {
        request.user = session.user;
        return;
      }

      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) return reply.status(404).send({ message: "Product not found" });
      if (product.userId !== session.user.id) {
        return reply.status(403).send({ message: "Forbidden: You do not own this listing" });
      }
      request.user = session.user;
      return;
    }
  }, productController.toggleAvailability);
}
