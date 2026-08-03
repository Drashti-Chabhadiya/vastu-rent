import { Capacitor } from '@capacitor/core'
import { NativeBiometric } from '@capgo/capacitor-native-biometric'

/**
 * Checks if biometric authentication is available on the device.
 */
export const checkBiometry = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false
  try {
    const result = await NativeBiometric.isAvailable()
    return result.isAvailable
  } catch (error) {
    console.error('Error checking biometry availability:', error)
    return false
  }
}

/**
 * Gets the type of biometric authentication available.
 */
export const getBiometryType = async (): Promise<string | null> => {
  if (!Capacitor.isNativePlatform()) return null
  try {
    const result = await NativeBiometric.isAvailable()
    switch (result.biometryType) {
      case 0:
        return null // None
      case 1:
        return 'TouchID'
      case 2:
        return 'FaceID'
      case 3:
        return 'Fingerprint'
      case 4:
        return 'Face Authentication'
      case 5:
        return 'Iris'
      default:
        return 'Biometrics'
    }
  } catch (error) {
    console.error('Error getting biometry type:', error)
    return null
  }
}

/**
 * Prompts the user for biometric authentication.
 */
export const authenticateBiometric = async (
  reason: string = 'Please authenticate to continue',
): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false
  try {
    await NativeBiometric.verifyIdentity({
      reason,
      title: 'Authentication Required',
      subtitle: 'Use your biometric to log in',
      description: 'We need to verify your identity before proceeding.',
    })
    return true
  } catch (error) {
    console.error('Biometric authentication failed:', error)
    return false
  }
}

/**
 * Safely sets the biometric credentials, deleting old ones first to prevent overwrite errors.
 */
export const setBiometricCredentials = async (
  username?: string,
  password?: string,
  server: string = 'vasturental.com',
): Promise<boolean> => {
  if (!Capacitor.isNativePlatform() || !username || !password) return false
  try {
    // Attempt to delete first to avoid keychain overwrite errors
    try {
      await NativeBiometric.deleteCredentials({ server })
    } catch (e) {
      // Ignore delete errors (might not exist yet)
    }

    await NativeBiometric.setCredentials({
      username,
      password,
      server,
    })
    return true
  } catch (error) {
    console.error('Failed to set biometric credentials:', error)
    return false
  }
}

/**
 * Retrieves the stored biometric credentials.
 */
export const getBiometricCredentials = async (
  server: string = 'vasturental.com',
) => {
  if (!Capacitor.isNativePlatform()) return null
  try {
    const credentials = await NativeBiometric.getCredentials({ server })
    return credentials
  } catch (error) {
    console.error('Failed to get biometric credentials:', error)
    return null
  }
}

/**
 * Deletes the stored biometric credentials.
 */
export const deleteBiometricCredentials = async (
  server: string = 'vasturental.com',
): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false
  try {
    await NativeBiometric.deleteCredentials({ server })
    return true
  } catch (error) {
    console.error('Failed to delete biometric credentials:', error)
    return false
  }
}
