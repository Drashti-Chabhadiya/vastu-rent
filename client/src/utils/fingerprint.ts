import fpPromise from '@fingerprintjs/fingerprintjs'

/**
 * Initializes FingerprintJS and returns a unique visitor ID for this device/browser.
 */
export async function getDeviceFingerprint(): Promise<string> {
  try {
    const fp = await fpPromise.load()
    const result = await fp.get()
    return result.visitorId
  } catch (error) {
    console.error('Error getting device fingerprint:', error)
    // Fallback to a random ID if fingerprinting fails (e.g. adblocker)
    return `fallback_${Math.random().toString(36).substring(2)}`
  }
}
