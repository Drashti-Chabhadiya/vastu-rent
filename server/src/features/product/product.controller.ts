import { FastifyRequest, FastifyReply } from "fastify";
import { productService } from "./product.service.js";

export class ProductController {
  async getAllProducts(request: FastifyRequest, reply: FastifyReply) {
    const products = await productService.getAllProducts(request.query as any);
    return { products };
  }

  async getRecentProducts(request: FastifyRequest, reply: FastifyReply) {
    const products = await productService.getRecentProducts();
    return { products };
  }

  async getProductById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const product = await productService.getProductById(id);
    if (!product) return reply.status(404).send({ message: "Product not found" });
    return { product };
  }

  async createProduct(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.id || (request.body as any).ownerId;
      const product = await productService.createProduct({ ...request.body as any, ownerId: userId });
      return { product };
    } catch (error: any) {
      if (error.message?.includes("Forbidden") || error.message?.includes("limit")) {
        return reply.status(403).send({ message: error.message });
      }
      return reply.status(500).send({ message: error.message || "Internal server error" });
    }
  }

  async updateProduct(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const user = (request as any).user;
      const product = await productService.updateProduct(id, request.body, user?.id, user?.role);
      return { product };
    } catch (error: any) {
      if (error.message.includes("Forbidden")) return reply.status(403).send({ message: error.message });
      if (error.message.includes("not found")) return reply.status(404).send({ message: error.message });
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async deleteProduct(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const user = (request as any).user;
      await productService.deleteProduct(id, user?.id, user?.role);
      return { success: true };
    } catch (error: any) {
      if (error.message.includes("Forbidden")) return reply.status(403).send({ message: error.message });
      if (error.message.includes("not found")) return reply.status(404).send({ message: error.message });
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async toggleAvailability(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const { isAvailable } = request.body as any;
    const product = await productService.toggleAvailability(id, isAvailable);
    return { product };
  }

  async getMyListings(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user.id;
    const products = await productService.getOwnerListings(userId);
    return { products };
  }
}

export const productController = new ProductController();
