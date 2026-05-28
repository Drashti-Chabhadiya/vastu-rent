import { Capacitor } from '@capacitor/core'

/**
 * Resolves the correct Socket.IO server URL at runtime.
 *
 * On Capacitor native (Android/iOS) the VITE_SOCKET_URL env var must be used
 * directly — we cannot derive anything from window.location because the
 * WebView origin is capacitor://localhost, not the backend server.
 */
export function getSocketUrl(): string {
  // ── Native Capacitor app ─────────────────────────────────────────────────
  // Always use the explicit env var baked in at build time.
  if (Capacitor.isNativePlatform()) {
    return (
      import.meta.env.VITE_SOCKET_URL || 'https://new-vastu-rent.onrender.com'
    )
  }

  // ── Web browser — explicit env var wins if set ────────────────────────────
  const envSocketUrl = import.meta.env.VITE_SOCKET_URL
  if (envSocketUrl) {
    return envSocketUrl
  }

  // ── Derive from API base URL (strip the /api suffix) ─────────────────────
  const envApiUrl = import.meta.env.VITE_API_BASE_URL
  if (envApiUrl) {
    return envApiUrl.replace(/\/api$/, '').replace(/\/api\/$/, '')
  }

  // ── Fallback to local dev server ─────────────────────────────────────────
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.')
    ) {
      return `http://${hostname}:4000`
    }
  }

  return 'http://localhost:4000'
}
