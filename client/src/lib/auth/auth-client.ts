import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

const getAuthBaseUrl = () => {
  // If we are in a browser and NOT on localhost/local network, use the current origin's /api/auth proxy path
  if (typeof window !== 'undefined' && 
      window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1' && 
      !window.location.hostname.startsWith('192.168.')) {
    return `${window.location.origin}/api/auth`;
  }
  // Otherwise, use the configured environment variable or fallback to localhost
  return import.meta.env.VITE_AUTH_URL || "http://localhost:4000/api/auth";
};

/**
 * Better Auth client — the single source of truth for all auth actions
 * and session state on the client.
 *
 * baseURL must point to where the server's Better Auth handler is mounted.
 * Cookies are sent automatically because we use `credentials: "include"`.
 */
export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
  plugins: [
    adminClient(),
  ],
});
