import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { Capacitor } from '@capacitor/core'

/**
 * Resolves the correct auth base URL at runtime.
 *
 * Priority order:
 *  1. Native Capacitor app — always talk directly to the Render backend to avoid
 *     the Vercel-proxy cookie-domain mismatch. All OAuth state/session cookies
 *     must live on the same origin (new-vastu-rent.onrender.com) so Chrome Custom
 *     Tab and the WebView share the same cookie jar.
 *  2. Web browser on a remote host (Vercel/production) — use the same-origin
 *     Vercel proxy so cookies land on the Vercel domain for the web app.
 *  3. Local development — use the explicit VITE_AUTH_URL env var.
 */
const getAuthBaseUrl = (): string => {
  // ── 1. Native Capacitor app — MUST come before hostname check ─────────────
  //    capacitor.config.ts sets server.url = 'https://new-vastu-rent-client.vercel.app'
  //    so window.location.hostname would be 'new-vastu-rent-client.vercel.app'
  //    and would incorrectly fall into the "remote production" branch below.
  //    By checking isNativePlatform() first we guarantee the native app always
  //    bypasses the Vercel proxy and hits the backend directly.
  if (Capacitor.isNativePlatform()) {
    return (
      import.meta.env.VITE_AUTH_URL ||
      'https://new-vastu-rent.onrender.com/api/auth'
    )
  }

  // ── 2. Web browser on a remote host (Vercel / staging) ───────────────────
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !window.location.hostname.startsWith('192.168.')
  ) {
    return `${window.location.origin}/api/auth`
  }

  // ── 3. Local development ────────────────────────────────────────────────
  return import.meta.env.VITE_AUTH_URL || 'http://localhost:4000/api/auth'
}

/**
 * Better Auth client — the single source of truth for all auth actions
 * and session state on the client.
 *
 * baseURL must point to where the server's Better Auth handler is mounted.
 * Cookies are sent automatically because we use `credentials: "include"`.
 */
export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
  plugins: [adminClient()],
  user: {
    additionalFields: {
      gender: { type: 'string', required: false },
      location: { type: 'string', required: false },
      phone: { type: 'string', required: false },
      language: { type: 'string', required: false },
      dob: { type: 'string', required: false },
      currency: { type: 'string', required: false },
      twoFactorEnabled: { type: 'boolean', required: false },
      bookingAlerts: { type: 'boolean', required: false },
      settlementAlerts: { type: 'boolean', required: false },
      marketingAlerts: { type: 'boolean', required: false },
    },
  },
})
