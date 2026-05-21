/**
 * Utility to manage APK download URLs across the project.
 * Handles development (localhost/IP) and production environments.
 */

export const getApkDownloadUrl = (customIp?: string) => {
  // 1. Check if a custom IP was provided (for local testing)
  if (customIp && customIp.trim() !== '') {
    // Ensure the IP doesn't already have http/port
    const cleanIp = customIp.replace(/^https?:\/\//, '').split(':')[0]
    return `http://${cleanIp}:3000${import.meta.env.VITE_APK_PATH || '/app-release.apk'}`
  }

  // 2. Get environment variables
  const publicUrl = import.meta.env.VITE_PUBLIC_URL
  const apkPath = import.meta.env.VITE_APK_PATH || '/app-release.apk'

  // 3. Logic for detecting the best URL
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''

  // If we are in production (not localhost/IP), prioritize the PUBLIC_URL if set
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)

  if (!isLocal && publicUrl) {
    return `${publicUrl}${apkPath}`
  }

  // Fallback to current origin (works for both local IP testing and production)
  return `${origin}${apkPath}`
}

export const APK_CONFIG = {
  VERSION: 'v1.0.1',
  SIZE: '18.5 MB',
  MIN_ANDROID: '8.0+',
  FILENAME: 'VastuRent.apk',
}
