import { redis, getRedisStatus } from "../config/redis.js";

/**
 * Safely fetches a value from Redis and parses it as JSON.
 * Returns null if the key doesn't exist, Redis is offline, or an error occurs.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!getRedisStatus()) return null;
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error: any) {
    console.warn(`⚠️ Cache GET failed for key "${key}":`, error.message);
    return null;
  }
}

/**
 * Safely sets a value in Redis with optional TTL (Time To Live).
 * Silently fails and logs a warning if Redis is offline or an error occurs.
 */
export async function cacheSet(key: string, value: any, ttlSeconds?: number): Promise<void> {
  if (!getRedisStatus()) return;
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.set(key, serialized, "EX", ttlSeconds);
    } else {
      await redis.set(key, serialized);
    }
  } catch (error: any) {
    console.warn(`⚠️ Cache SET failed for key "${key}":`, error.message);
  }
}

/**
 * Safely deletes one or more keys from Redis.
 * Silently fails and logs a warning if Redis is offline or an error occurs.
 */
export async function cacheDel(key: string | string[]): Promise<void> {
  if (!getRedisStatus()) return;
  try {
    const keysToDelete = Array.isArray(key) ? key : [key];
    if (keysToDelete.length > 0) {
      await redis.unlink(keysToDelete); // unlink is non-blocking delete
    }
  } catch (error: any) {
    console.warn(`⚠️ Cache DEL failed for key(s) "${key}":`, error.message);
  }
}

/**
 * Safely deletes all keys matching a specific pattern.
 * Uses SCAN internally to find keys incrementally and UNLINK to delete them,
 * preventing blocks on the Redis server.
 */
export async function cacheDelPattern(pattern: string): Promise<void> {
  if (!getRedisStatus()) return;
  try {
    let cursor = "0";
    do {
      const reply = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = reply[0];
      const keys = reply[1];
      if (keys.length > 0) {
        await redis.unlink(keys);
      }
    } while (cursor !== "0");
  } catch (error: any) {
    console.warn(`⚠️ Cache DEL pattern failed for "${pattern}":`, error.message);
  }
}
