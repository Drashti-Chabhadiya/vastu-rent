import "dotenv/config";
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import { authRoutes } from "./routes/auth.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import { productRoutes } from "./routes/product.routes.js";
import { categoryRoutes } from "./routes/category.routes.js";
import { reviewRoutes } from "./routes/review.routes.js";
import { rentalRoutes } from "./routes/rental.routes.js";
import { statsRoutes } from "./routes/stats.routes.js";

import multipart from "@fastify/multipart";
import { uploadRoutes } from "./routes/upload.routes.js";
import { likeRoutes } from "./routes/like.routes.js";
import { deleteRequestRoutes } from "./routes/delete-request.routes.js";
import { paymentRoutes } from "./routes/payment.routes.js";

export const app = Fastify({ logger: true, trustProxy: true });

// ─── Plugins ─────────────────────────────────────────────────────────────────

app.register(cookie);
app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

app.register(cors, {
  origin: process.env.CLIENT_URL ?? "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-better-auth-session-token", "better-auth-session-token"],
});

// ─── Routes ──────────────────────────────────────────────────────────────────

// Better Auth
app.register(authRoutes, { prefix: "/api/auth" });

// Entity Routes
app.register(userRoutes, { prefix: "/api/users" }); // Public profile access
app.register(userRoutes, { prefix: "/api/admin/users" }); // Admin management
app.register(productRoutes, { prefix: "/api/products" });
app.register(categoryRoutes, { prefix: "/api/categories" });
app.register(reviewRoutes, { prefix: "/api/reviews" });
app.register(rentalRoutes, { prefix: "/api/rentals" });
app.register(statsRoutes, { prefix: "/api/admin/stats" });
app.register(uploadRoutes, { prefix: "/api/upload" });
app.register(likeRoutes, { prefix: "/api/likes" });
app.register(deleteRequestRoutes, { prefix: "/api/delete-requests" });
app.register(paymentRoutes, { prefix: "/api/payments" });

// Aliases for backward compatibility with the frontend
app.register(productRoutes, { prefix: "/api/admin/products" });
app.register(categoryRoutes, { prefix: "/api/admin/categories" });
app.register(reviewRoutes, { prefix: "/api/admin/reviews" });


// Legacy redirects
app.get("/api/my-rentals", async (req, reply) => reply.redirect("/api/rentals/my"));
app.get("/api/my-listings", async (req, reply) => reply.redirect("/api/products/my-listings"));

// Health check
app.get("/api/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));
app.get("/", async () => ({ message: "Vastu-Rent API is running" }));