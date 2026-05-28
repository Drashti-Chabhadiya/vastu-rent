import "dotenv/config";
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";

// ─── Feature Routes ───────────────────────────────────────────────────────────
import { authRoutes } from "./features/auth/auth.routes.js";
import { userRoutes } from "./features/user/user.routes.js";
import { productRoutes } from "./features/product/product.routes.js";
import { categoryRoutes } from "./features/category/category.routes.js";
import { categoryRequestRoutes } from "./features/category-request/category-request.routes.js";
import { couponRoutes } from "./features/coupon/coupon.routes.js";
import { disputeRoutes } from "./features/dispute/dispute.routes.js";
import { notificationRoutes } from "./features/notification/notification.routes.js";
import { reviewRoutes } from "./features/review/review.routes.js";
import { rentalRoutes } from "./features/rental/rental.routes.js";
import { statsRoutes } from "./features/stats/stats.routes.js";
import { uploadRoutes } from "./features/upload/upload.routes.js";
import { likeRoutes } from "./features/like/like.routes.js";
import { deleteRequestRoutes } from "./features/delete-request/delete-request.routes.js";
import { paymentRoutes } from "./features/payment/payment.routes.js";
import { payoutRoutes } from "./features/payout/payout.routes.js";
import { storyRoutes } from "./features/story/story.routes.js";
import { chatRoutes } from "./features/chat/chat.routes.js";
import { supportRoutes } from "./features/support/support.routes.js";
import { billingRoutes } from "./features/billing/billing.routes.js";
import { settingsRoutes } from "./features/settings/settings.routes.js";


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
  // origin: process.env.CLIENT_URL ?? "http://192.168.1.8:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-better-auth-session-token", "better-auth-session-token"],
});

// ─── Routes ──────────────────────────────────────────────────────────────────

// Better Auth
app.register(authRoutes, { prefix: "/api/auth" });

// Entity Routes
app.register(userRoutes, { prefix: "/api/users" });          // Public profile access
app.register(userRoutes, { prefix: "/api/admin/users" });    // Admin management
app.register(productRoutes, { prefix: "/api/products" });
app.register(categoryRoutes, { prefix: "/api/categories" });
app.register(categoryRequestRoutes, { prefix: "/api/category-requests" });
app.register(couponRoutes, { prefix: "/api/coupons" });
app.register(disputeRoutes, { prefix: "/api/disputes" });
app.register(notificationRoutes, { prefix: "/api/notifications" });
app.register(reviewRoutes, { prefix: "/api/reviews" });
app.register(rentalRoutes, { prefix: "/api/rentals" });
app.register(statsRoutes, { prefix: "/api/admin/stats" });
app.register(uploadRoutes, { prefix: "/api/upload" });
app.register(likeRoutes, { prefix: "/api/likes" });
app.register(deleteRequestRoutes, { prefix: "/api/delete-requests" });
app.register(paymentRoutes, { prefix: "/api/payments" });
app.register(payoutRoutes, { prefix: "/api/payouts" });
app.register(storyRoutes, { prefix: "/api/stories" });
app.register(chatRoutes, { prefix: "/api/chat" });
app.register(supportRoutes, { prefix: "/api" });
app.register(billingRoutes, { prefix: "/api/billing" });
app.register(settingsRoutes, { prefix: "/api/settings" });

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
