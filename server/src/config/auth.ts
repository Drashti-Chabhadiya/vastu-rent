import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { admin, bearer } from "better-auth/plugins";
import { sendVerificationEmail, sendResetPasswordEmail } from "../lib/mail.js";

const getHostName = (urlStr?: string) => {
  if (!urlStr) return "";
  try {
    const formatted = urlStr.startsWith("http://") || urlStr.startsWith("https://") ? urlStr : `https://${urlStr}`;
    return new URL(formatted).host;
  } catch (e) {
    return "";
  }
};

export const auth = betterAuth({
  /**
   * The base URL where the auth server is running.
   * Better Auth uses this to build callback/redirect URLs.
   */
  baseURL: {
    allowedHosts: [
      "new-vastu-rent.onrender.com",
      "new-vastu-rent-client.vercel.app",
      "localhost:4000",
      "localhost:3000",
      "127.0.0.1:4000",
      "127.0.0.1:3000",
      "*.vercel.app",
      "*.onrender.com",
      getHostName(process.env.BETTER_AUTH_URL),
      getHostName(process.env.CLIENT_URL),
    ].filter(Boolean) as string[],
  },

  /**
   * Secret used to sign cookies and tokens.
   * Must be a long random string — keep it in .env only.
   */
  secret: process.env.BETTER_AUTH_SECRET,

  /**
   * Prisma adapter connects Better Auth to your PostgreSQL database.
   */
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  user: {
    additionalFields: {
      gender: { type: "string", required: false },
      location: { type: "string", required: false },
      phone: { type: "string", required: false },
      language: { type: "string", required: false },
      dob: { type: "string", required: false },
      currency: { type: "string", required: false },
      twoFactorEnabled: { type: "boolean", required: false },
      bookingAlerts: { type: "boolean", required: false },
      settlementAlerts: { type: "boolean", required: false },
      marketingAlerts: { type: "boolean", required: false },
      subscriptionTier: { type: "string", required: false },
      subscriptionExpiresAt: { type: "date", required: false },
      stripeCustomerId: { type: "string", required: false },
      stripeSubscriptionId: { type: "string", required: false },
    }
  },

  /**
   * Enable email + password sign-up / sign-in.
   */
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      await sendResetPasswordEmail({
        email: user.email,
        name: user.name || "",
        url,
        token,
      });
    },
  },

  /**
   * Hook up email verification sending logic.
   */
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      await sendVerificationEmail({
        email: user.email,
        name: user.name || "",
        url,
        token,
      });
    },
  },

  /**
   * Allow cross-origin requests from the client dev server.
   * Better Auth will set the correct CORS headers automatically.
   */
  trustedOrigins: [
    // Local development
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost',
    // Capacitor WebView
    'capacitor://localhost',
    // Production web app (Vercel)
    'https://new-vastu-rent-client.vercel.app',
    // Production backend (Render) — needed when Render itself is the callbackURL origin
    'https://new-vastu-rent.onrender.com',
    // Dynamic env-configured origins
    process.env.CLIENT_URL,
    process.env.BETTER_AUTH_URL,
  ].filter(Boolean) as string[],



  /**
   * Enable social authentication providers.
   */
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },

  /**
   * Enable the admin plugin for role management.
   */
  plugins: [
    admin(),
    bearer(),
  ],
});

/**
 * Inferred type of the auth instance — useful for server-side type checking.
 */
export type Auth = typeof auth;