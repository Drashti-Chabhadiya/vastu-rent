import axios from 'axios'
import { Capacitor } from '@capacitor/core'
import { getBearerToken } from '#/lib/auth/token-storage'

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
  let url = ''
  if (Capacitor.isNativePlatform()) {
    url = import.meta.env.VITE_API_BASE_URL
  } else if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !window.location.hostname.startsWith('192.168.')
  ) {
    url = `${window.location.origin}/api`
  } else {
    url = import.meta.env.VITE_API_BASE_URL
  }

  // On Android emulator, 'localhost' refers to the emulator itself, so we must
  // route request to 10.0.2.2 to access the host machine's dev server.
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    url = url.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2')
  }
  return url
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  // Abort requests that take longer than 15 seconds so a stalled mobile
  // connection fails fast instead of hanging the UI indefinitely.
  timeout: 15_000,
})

// Attach bearer token for native mobile requests to authenticate correctly

let csrfToken: string | null = null
let csrfTokenPromise: Promise<string | null> | null = null

const getCsrfToken = async () => {
  if (csrfToken) return csrfToken
  if (csrfTokenPromise) return csrfTokenPromise

  csrfTokenPromise = apiClient
    .get('/csrf-token')
    .then((res) => {
      csrfToken = res.data.token
      csrfTokenPromise = null
      return csrfToken
    })
    .catch((err) => {
      console.error('Failed to fetch CSRF token:', err)
      csrfTokenPromise = null
      return null
    })

  return csrfTokenPromise
}

apiClient.interceptors.request.use(async (config) => {
  if (Capacitor.isNativePlatform()) {
    const token = await getBearerToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  // Attach CSRF token for mutating requests (only required for web browsers)
  const mutatingMethods = ['post', 'put', 'patch', 'delete']
  if (
    !Capacitor.isNativePlatform() &&
    config.method &&
    mutatingMethods.includes(config.method.toLowerCase())
  ) {
    const token = await getCsrfToken()
    if (token) {
      config.headers['x-csrf-token'] = token
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
    // Intercept unverified users and redirect them to the OTP verification screen
    if (
      error.response?.status === 403 &&
      error.response?.data?.error === 'EMAIL_NOT_VERIFIED'
    ) {
      if (!window.location.pathname.includes('/verify-email')) {
        window.location.href = '/verify-email'
      }
      return Promise.reject(error)
    }

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
