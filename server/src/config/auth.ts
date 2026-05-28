import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { admin } from "better-auth/plugins";
import { sendVerificationEmail } from "../lib/mail.js";

export const auth = betterAuth({
  /**
   * The base URL where the auth server is running.
   * Better Auth uses this to build callback/redirect URLs.
   */
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:4000",

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
    process.env.CLIENT_URL,
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter(Boolean) as string[],

  /**
   * Enable the admin plugin for role management.
   */
  plugins: [
    admin(),
  ],
});

/**
 * Inferred type of the auth instance — useful for server-side type checking.
 */
export type Auth = typeof auth;