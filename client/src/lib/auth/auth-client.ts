import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { Capacitor } from '@capacitor/core'

/**
 * Resolves the correct auth base URL at runtime.
 *
 * For the Capacitor app, `capacitor.config.ts` sets
 * `server.url = 'https://new-vastu-rent-client.vercel.app'`
 * so `window.location.hostname` is always 'new-vastu-rent-client.vercel.app'
 * in the WebView — both on native and in a regular browser.
 *
 * We route ALL production traffic (native + web) through the Vercel proxy.
 * This ensures:
 *  - State cookie is set on new-vastu-rent-client.vercel.app ✓
 *  - Google redirect_uri matches the Vercel callback URI in Google Console ✓
 *  - Chrome Custom Tab and WebView share the Vercel-domain cookie jar ✓
 *  - Session cookie is picked up after OAuth without any extra work ✓
 *
 * The original state_mismatch was fixed in auth.routes.ts by removing the
 * BETTER_AUTH_URL override that forced cookies onto the wrong domain.
 */
const getAuthBaseUrl = (): string => {
  // ── 1. Native Capacitor app — MUST come before hostname check ─────────────
  if (Capacitor.isNativePlatform()) {
    return (
      import.meta.env.VITE_AUTH_URL ||
      'https://new-vastu-rent.onrender.com/api/auth'
    )
  }

  // ── 2. Production / remote host (Vercel, staging) ──────────────────────────
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !window.location.hostname.startsWith('192.168.')
  ) {
    // window.location.origin is 'https://new-vastu-rent-client.vercel.app'
    // for both the native Capacitor WebView and the regular browser.
    return `${window.location.origin}/api/auth`
  }

  // ── 3. Local development ───────────────────────────────────────────────────
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
  fetchOptions: {
    onRequest: (ctx) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null
      if (token) {
        ctx.headers.set('Authorization', `Bearer ${token}`)
      }
    },
    onResponse: (ctx) => {
      if (typeof window !== 'undefined') {
        const url = ctx.request?.url?.toString() || ''
        if (url.includes('/sign-out')) {
          localStorage.removeItem('session_token')
        }
      }
    },
    onError: (ctx) => {
      if (typeof window !== 'undefined') {
        if (ctx.error?.status === 401) {
          localStorage.removeItem('session_token')
        }
      }
    }
  },
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
