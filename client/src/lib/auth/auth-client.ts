import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { Capacitor } from '@capacitor/core'

/**
 * Resolves the correct auth base URL at runtime.
 *
 * On Capacitor native (Android/iOS) we must use the explicit env var because
 * window.location.origin is the WebView's own scheme (capacitor://localhost),
 * not the backend server.
 */
const getAuthBaseUrl = (): string => {
  // ── Native Capacitor app ────────────────────────────────────────────────
  if (Capacitor.isNativePlatform()) {
    return (
      import.meta.env.VITE_AUTH_URL ||
      'https://new-vastu-rent-server.vercel.app/api/auth'
    )
  }

  // ── Web browser — non-local origin (production / staging) ───────────────
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !window.location.hostname.startsWith('192.168.')
  ) {
    return `${window.location.origin}/api/auth`
  }

  // ── Local development ───────────────────────────────────────────────────
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
