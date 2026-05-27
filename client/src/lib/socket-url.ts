export function getSocketUrl(): string {
  // 1. Check if a dedicated WebSocket URL is defined in the environment variables
  const envSocketUrl = import.meta.env.VITE_SOCKET_URL
  if (envSocketUrl) {
    return envSocketUrl
  }

  // 2. Otherwise, dynamically derive it from the API base URL (by stripping the '/api' suffix)
  const envApiUrl = import.meta.env.VITE_API_BASE_URL
  if (envApiUrl) {
    return envApiUrl.replace(/\/api$/, '').replace(/\/api\/$/, '')
  }

  // 3. Fallback automatically to local development server if on local network/localhost
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

  // Default fallback if no environment variable is present and not on a local network
  return 'http://localhost:4000'
}
