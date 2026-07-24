import { Redis } from 'ioredis'
import 'dotenv/config'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

let isRedisConnected = false

// Create the Redis client
// maxRetriesPerRequest: null ensures ioredis keeps trying to reconnect rather than erroring out, which is good for resiliency.
export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  reconnectOnError: (err) => {
    console.warn('⚠️ Redis reconnecting on error:', err.message)
    return true // reconnect
  },
})

// Event listeners for state tracking and logging
redis.on('connect', () => {
  console.log('🔌 Redis: connecting...')
})

redis.on('ready', () => {
  isRedisConnected = true
  console.log('🔴 Redis: connected successfully and ready')
})

redis.on('error', (error) => {
  isRedisConnected = false
  console.error('❌ Redis: error occurred:', error.message)
})

redis.on('close', () => {
  isRedisConnected = false
  console.log('🔌 Redis: connection closed')
})

export function getRedisStatus(): boolean {
  return isRedisConnected
}
