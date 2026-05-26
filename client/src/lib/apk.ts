/**
 * Utility to manage APK download URLs across the project.
 * Handles development (localhost/IP) and production environments.
 */

export const getApkDownloadUrl = (customIp?: string) => {
  // 1. Check if a custom IP was provided (for local testing)
  if (customIp && customIp.trim() !== '') {
    // Ensure the IP doesn't already have http/port
    const cleanIp = customIp.replace(/^https?:\/\//, '').split(':')[0]
    return `http://${cleanIp}:3000/app-release.apk`
  }

  // 2. Get environment variables
  const apkPath = import.meta.env.VITE_APK_PATH || '/app-release.apk'

  // If VITE_APK_PATH is a fully-qualified URL, use it directly (e.g. customized in .env)
  if (apkPath.startsWith('http://') || apkPath.startsWith('https://')) {
    return apkPath
  }

  // 3. Logic for detecting the environment
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''

  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)

  // In production (non-localhost), default to the secure GitHub release APK link
  if (!isLocal) {
    return 'https://github.com/Drashti-Chabhadiya/new-vastu-rent/releases/download/v1.0.0/app-release.apk'
  }

  // Fallback to current origin for local dev testing
  return `${origin}${apkPath}`
}

export const APK_CONFIG = {
  VERSION: 'v1.0.0',
  SIZE: '29.2 MB',
  MIN_ANDROID: '8.0+',
  FILENAME: 'app-release.apk',
}
