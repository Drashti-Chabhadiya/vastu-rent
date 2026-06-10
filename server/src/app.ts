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
import { paymentRoutes } from "./features/payment/payment.routes.js";
import { payoutRoutes } from "./features/payout/payout.routes.js";
import { storyRoutes } from "./features/story/story.routes.js";
import { chatRoutes } from "./features/chat/chat.routes.js";
import { supportRoutes } from "./features/support/support.routes.js";
import { billingRoutes } from "./features/billing/billing.routes.js";
import { settingsRoutes } from "./features/settings/settings.routes.js";
import { deleteRequestRoutes } from "./features/delete-request/delete-request.routes.js";
import { categoryDeleteRequestRoutes } from "./features/category-delete-request/category-delete-request.routes.js";


export const app = Fastify({ logger: true, trustProxy: true });

// ─── Plugins ─────────────────────────────────────────────────────────────────

app.register(cookie);
app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

app.register(cors, {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true)
      return
    }

    const allowed = [
      process.env.CLIENT_URL,
      'https://new-vastu-rent-client.vercel.app',
      'https://new-vastu-rent.onrender.com',
      'capacitor://localhost',
      'http://localhost',
      'http://localhost:3000',
    ].filter(Boolean) as string[]

    const isLocalOrCapacitor =
      allowed.includes(origin) ||
      origin.startsWith('capacitor://') ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('https://localhost') ||
      /\/\/(127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin);

    if (isLocalOrCapacitor) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`), false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-better-auth-session-token', 'better-auth-session-token'],
  exposedHeaders: ['set-auth-token'],
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
app.register(paymentRoutes, { prefix: "/api/payments" });
app.register(payoutRoutes, { prefix: "/api/payouts" });
app.register(storyRoutes, { prefix: "/api/stories" });
app.register(chatRoutes, { prefix: "/api/chat" });
app.register(supportRoutes, { prefix: "/api" });
app.register(billingRoutes, { prefix: "/api/billing" });
app.register(settingsRoutes, { prefix: "/api/settings" });
app.register(deleteRequestRoutes, { prefix: "/api/delete-requests" });
app.register(categoryDeleteRequestRoutes, { prefix: "/api/category-delete-requests" });

// Aliases for backward compatibility with the frontend
app.register(productRoutes, { prefix: "/api/admin/products" });
app.register(categoryRoutes, { prefix: "/api/admin/categories" });
app.register(reviewRoutes, { prefix: "/api/admin/reviews" });

// Legacy redirects
app.get("/api/my-rentals", async (_req, reply) => reply.redirect("/api/rentals/my"));
app.get("/api/my-listings", async (_req, reply) => reply.redirect("/api/products/my-listings"));

// Health check
app.get("/api/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));
app.get("/", async () => ({ message: "Vastu-Rent API is running" }));

/**
 * Native Capacitor OAuth callback page.
 *
 * After Better Auth completes the Google OAuth flow on the Render server it
 * sets the session cookie on `new-vastu-rent.onrender.com` and redirects
 * to the `callbackURL` — which for the native app is this endpoint.
 *
 * This page immediately JS-redirects to `com.vasturent.app://auth-done`.
 * Android intercepts the custom scheme, brings the Capacitor app to the
 * foreground (firing `appUrlOpen`), and Chrome Custom Tab closes automatically.
 *
 * On web (non-mobile) the page falls back to redirecting to the Vercel client.
 */
app.get("/oauth-callback", async (_req, reply) => {
  reply.type("text/html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Signing in…</title>
  <style>
    body { margin: 0; display: flex; flex-direction: column; align-items: center;
           justify-content: center; min-height: 100dvh; gap: 16px;
           font-family: system-ui, sans-serif; background: #f8f9fa; }
    svg { animation: pop .35s ease; }
    @keyframes pop { from { transform: scale(.6); opacity: 0 } to { transform: scale(1); opacity: 1 } }
    p { margin: 0; font-size: 15px; color: #6b7280; }
  </style>
</head>
<body>
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="32" fill="#1a7a4a"/>
    <path d="M20 32l9 9 15-15" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <p>Login Successful — returning to app…</p>
  <script>
    // Redirect to custom scheme — Android intercepts and fires appUrlOpen.
    window.location.href = 'com.vasturent.app://auth-done';
    // Fallback: if not intercepted (web browser), go to the web client.
    setTimeout(function () {
      window.location.replace('https://new-vastu-rent-client.vercel.app/');
    }, 1200);
  </script>
</body>
</html>`);
});

