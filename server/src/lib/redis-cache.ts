/**
 * Fast in-memory cache replacing Redis.
 * Works seamlessly in Node.js memory without external Redis dependency.
 */
interface CacheEntry {
  value: string
  expiresAt?: number
}

const memoryCache = new Map<string, CacheEntry>()

export async function cacheGet<T>(key: string): Promise<T | null> {
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    memoryCache.delete(key)
    return null
  }
  try {
    return JSON.parse(entry.value) as T
  } catch {
    return null
  }
}

export async function cacheSet(
  key: string,
  value: any,
  ttlSeconds?: number,
): Promise<void> {
  const serialized = JSON.stringify(value)
  const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined
  memoryCache.set(key, { value: serialized, expiresAt })
}

export async function cacheDel(key: string | string[]): Promise<void> {
  const keysToDelete = Array.isArray(key) ? key : [key]
  for (const k of keysToDelete) {
    memoryCache.delete(k)
  }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key)
    }
  }
}
