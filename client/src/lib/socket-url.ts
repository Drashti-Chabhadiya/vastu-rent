import { Capacitor } from '@capacitor/core'

/**
 * Resolves the correct Socket.IO server URL at runtime.
 *
 * On Capacitor native (Android/iOS) the VITE_SOCKET_URL env var must be used
 * directly — we cannot derive anything from window.location because the
 * WebView origin is capacitor://localhost, not the backend server.
 */
export function getSocketUrl(): string {
  let url = ''
  if (Capacitor.isNativePlatform()) {
    url =
      import.meta.env.VITE_SOCKET_URL ||
      'https://new-vastu-rent-zyap.onrender.com'
  } else {
    // ── Web browser — explicit env var wins if set ────────────────────────────
    const envSocketUrl = import.meta.env.VITE_SOCKET_URL
    if (envSocketUrl) {
      url = envSocketUrl
    } else {
      // ── Derive from API base URL (strip the /api suffix) ─────────────────────
      const envApiUrl = import.meta.env.VITE_API_BASE_URL
      if (envApiUrl) {
        url = envApiUrl.replace(/\/api$/, '').replace(/\/api\/$/, '')
      } else if (typeof window !== 'undefined') {
        // ── Fallback to local dev server ─────────────────────────────────────────
        const hostname = window.location.hostname
        if (
          hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname.startsWith('192.168.')
        ) {
          url = `http://${hostname}:4000`
        } else {
          url = 'http://localhost:4000'
        }
      } else {
        url = 'http://localhost:4000'
      }
    }
  }

  // On Android emulator, rewrite localhost to 10.0.2.2 to connect to host dev server
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    url = url.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2')
  }
  return url
}
