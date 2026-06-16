import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin'

let inMemoryToken: string | null = null
let isInitialized = false
let initPromise: Promise<void> | null = null

// Initialize token from Secure Storage
export function initSecureToken(): Promise<void> {
  if (isInitialized) return Promise.resolve()
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      const { value } = await SecureStoragePlugin.get({ key: 'bearer_token' })
      inMemoryToken = value || null
    } catch (err) {
      // capacitor-secure-storage-plugin throws an error if key is not found
      inMemoryToken = null
    }
    isInitialized = true
  })()

  return initPromise
}

export function getBearerTokenSync(): string {
  return inMemoryToken || ''
}

export async function getBearerToken(): Promise<string> {
  await initSecureToken()
  return inMemoryToken || ''
}

export async function setBearerToken(token: string): Promise<void> {
  inMemoryToken = token
  isInitialized = true
  await SecureStoragePlugin.set({ key: 'bearer_token', value: token })
}

export async function removeBearerToken(): Promise<void> {
  inMemoryToken = null
  isInitialized = true
  try {
    await SecureStoragePlugin.remove({ key: 'bearer_token' })
  } catch (err) {
    // Ignore errors if already removed or not found
  }
}
