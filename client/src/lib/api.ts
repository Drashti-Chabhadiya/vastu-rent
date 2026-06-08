import axios from 'axios'
import { Capacitor } from '@capacitor/core'

/**
 * Resolves the correct API base URL at runtime.
 *
 * Priority order:
 *  1. On a Capacitor native platform (Android/iOS), always use the
 *     VITE_API_BASE_URL env var so requests go to the real server,
 *     never to the WebView's own origin (capacitor://localhost).
 *  2. On a browser served from a non-local origin (Vercel / production
 *     web), use the current origin's /api proxy path.
 *  3. Everything else (local dev) falls back to the env var or localhost.
 */
const getApiBaseUrl = (): string => {
  // ── Native Capacitor app (Android / iOS) ───────────────────────────────
  // window.location.origin is the WebView origin, NOT the backend server.
  // We must use the explicit env var that was baked in at build time.
  if (Capacitor.isNativePlatform()) {
    return (
      import.meta.env.VITE_API_BASE_URL ||
      'https://new-vastu-rent.onrender.com/api'
    )
  }

  // ── Web browser — non-local origin (production / staging) ─────────────
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !window.location.hostname.startsWith('192.168.')
  ) {
    return `${window.location.origin}/api`
  }

  // ── Local development ──────────────────────────────────────────────────
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  // Abort requests that take longer than 15 seconds so a stalled mobile
  // connection fails fast instead of hanging the UI indefinitely.
  timeout: 15_000,
})

// Attach bearer token for native mobile requests to authenticate correctly
apiClient.interceptors.request.use((config) => {
  if (Capacitor.isNativePlatform()) {
    const token = localStorage.getItem('bearer_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// ─── Response interceptor — single silent retry on network errors ───────────
// This handles transient mobile blips (brief connectivity drops, cell
// handoffs) that would otherwise permanently fail a request.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config

    // Only retry once, only for network-level failures (no response received)
    // or 503 / 429 (server temporarily unavailable / rate-limit).
    const isNetworkError = !error.response
    const isRetryableStatus =
      error.response?.status === 503 || error.response?.status === 429

    if (!config._retried && (isNetworkError || isRetryableStatus)) {
      config._retried = true

      // Wait 1.5 s before retrying to give the network a moment to recover.
      await new Promise((resolve) => setTimeout(resolve, 1_500))

      return apiClient(config)
    }

    return Promise.reject(error)
  },
)
