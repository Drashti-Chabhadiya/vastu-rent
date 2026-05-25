export function getSocketUrl(): string {
  // If we have an environment variable VITE_API_BASE_URL, try to derive the socket URL from it
  const envApiUrl = import.meta.env.VITE_API_BASE_URL
  if (envApiUrl) {
    const url = envApiUrl.replace(/\/api$/, '').replace(/\/api\/$/, '')
    // Ensure we do not use the static Vercel client domain as the socket server
    if (
      !url.includes('new-vastu-rent-client.vercel.app') &&
      (typeof window === 'undefined' || !url.includes(window.location.hostname))
    ) {
      return url
    }
  }

  // Fallback checks based on current hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'new-vastu-rent-client.vercel.app') {
      return 'https://new-vastu-rent.onrender.com'
    }
    // If we're on localhost or another local hostname, connect directly to port 4000
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
      return `http://${hostname}:4000`
    }
  }

  return 'https://new-vastu-rent.onrender.com'
}
