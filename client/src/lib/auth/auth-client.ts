import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { Capacitor } from '@capacitor/core'
import {
  getBearerTokenSync,
  setBearerToken,
  removeBearerToken,
} from '#/lib/auth/token-storage'

/**
 * Resolves the correct auth base URL at runtime.
 *
 * Native Capacitor app (no server.url):
 *   - WebView origin is `capacitor://localhost`
 *   - Capacitor.isNativePlatform() = true
 *   - Must use the Render production URL directly (cookies don't work cross-domain)
 *   - Bearer token auth is the session mechanism
 *
 * Web browser (Vercel production):
 *   - window.location.hostname = new-vastu-rent-client.vercel.app
 *   - Routes through /api/auth Vercel proxy → Render server
 *   - Cookie-based session works normally
 *
 * Local development:
 *   - window.location.hostname = localhost
 *   - Uses VITE_AUTH_URL which points to http://localhost:4000/api/auth
 */
const getAuthBaseUrl = (): string => {
  let url = ''
  // Native Capacitor app — always use the Render server directly
  if (Capacitor.isNativePlatform()) {
    url =
      import.meta.env.VITE_AUTH_URL ||
      'https://new-vastu-rent.onrender.com/api/auth'
  } else if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !window.location.hostname.startsWith('192.168.')
  ) {
    url = `${window.location.origin}/api/auth`
  } else {
    // Local development
    url = import.meta.env.VITE_AUTH_URL || 'http://localhost:4000/api/auth'
  }

  // On Android emulator, rewrite localhost to 10.0.2.2 to connect to host dev server
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    url = url.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2')
  }
  return url
}

/**
 * Better Auth client — single source of truth for all auth actions.
 *
 * On native Capacitor, cookies from onrender.com are blocked by the same-origin
 * policy. The `bearer()` plugin on the server provides a session token via the
 * `set-auth-token` response header, which we store in secure storage and send back
 * as `Authorization: Bearer <token>` on every subsequent request.
 */
export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),

  plugins: [adminClient()],
  fetchOptions: {
    auth: {
      type: 'Bearer',
      token: () => {
        if (Capacitor.isNativePlatform()) {
          return getBearerTokenSync()
        }
        return ''
      },
    },
    onSuccess: async (ctx) => {
      if (Capacitor.isNativePlatform()) {
        // Clear token on sign-out
        if (ctx.response.url.includes('/sign-out')) {
          await removeBearerToken()
          return
        }

        // 1. Primary: set-auth-token header (Better Auth bearer plugin)
        const setAuthToken = ctx.response.headers.get('set-auth-token')
        if (setAuthToken) {
          await setBearerToken(decodeURIComponent(setAuthToken))
          return
        }

        // 2. Fallback: Authorization header
        const authHeader =
          ctx.response.headers.get('Authorization') ||
          ctx.response.headers.get('authorization')
        if (authHeader?.startsWith('Bearer ')) {
          await setBearerToken(authHeader.slice(7))
          return
        }

        // 3. Last resort: try to parse JSON body for a token field
        try {
          const body = ctx.data
          const token = body?.token || body?.data?.token
          if (token) {
            await setBearerToken(decodeURIComponent(String(token)))
          }
        } catch {
          // Ignore parse errors
        }
      }
    },
    onError: async (ctx) => {
      if (Capacitor.isNativePlatform() && ctx.error.status === 401) {
        await removeBearerToken()
      }
    },
  },
  user: {
    additionalFields: {
      gender: { type: 'string', required: false },
      phone: { type: 'string', required: false },
      language: { type: 'string', required: false },
      dob: { type: 'string', required: false },
      currency: { type: 'string', required: false },
      twoFactorEnabled: { type: 'boolean', required: false },
      bookingAlerts: { type: 'boolean', required: false },
      settlementAlerts: { type: 'boolean', required: false },
      marketingAlerts: { type: 'boolean', required: false },
      subscriptionTier: { type: 'string', required: false },
      subscriptionExpiresAt: { type: 'date', required: false },
      stripeCustomerId: { type: 'string', required: false },
      stripeSubscriptionId: { type: 'string', required: false },
      showProfile: { type: 'boolean', required: false },
      showOnline: { type: 'boolean', required: false },
      allowData: { type: 'boolean', required: false },
      lastActive: { type: 'date', required: false },
      isGreenMember: { type: 'boolean', required: false },
      instagramUrl: { type: 'string', required: false },
      facebookUrl: { type: 'string', required: false },
      deviceFingerprint: { type: 'string', required: false },
    },
  },
})
