import axios from 'axios'

const getApiBaseUrl = () => {
  // If we are in a browser and NOT on localhost/local network, use the current origin's /api proxy path
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !window.location.hostname.startsWith('192.168.')
  ) {
    return `${window.location.origin}/api`
  }
  // Otherwise, use the configured environment variable or fallback to localhost
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
})
