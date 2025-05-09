import { Redis } from "@upstash/redis"
import { getRedisConfig } from "./test-utils"

// Redis client singleton
let redisClient: Redis | null = null

// Redis connection options
interface RedisOptions {
  url?: string
  token?: string
  enableLogging?: boolean
}

/**
 * Initialize Redis client with provided options or stored/environment variables
 */
export function initRedisClient(options?: RedisOptions): Redis | null {
  // Skip initialization if already initialized
  if (redisClient) return redisClient

  try {
    // First try options
    let url = options?.url
    let token = options?.token

    // Then try localStorage (for client-side)
    if (!url || !token) {
      const storedConfig = getRedisConfig()
      url = url || storedConfig.url
      token = token || storedConfig.token
    }

    // Finally try environment variables (for server-side)
    url = url || process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
    token = token || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN

    // Validate required configuration
    if (!url || !token) {
      if (options?.enableLogging) {
        console.warn("Redis initialization failed: Missing URL or token")
      }
      return null
    }

    // Create Redis client
    redisClient = new Redis({
      url,
      token,
    })

    if (options?.enableLogging) {
      console.log("Redis client initialized successfully")
    }

    return redisClient
  } catch (error) {
    if (options?.enableLogging) {
      console.error("Redis initialization error:", error)
    }
    return null
  }
}

/**
 * Get the Redis client instance, initializing if necessary
 */
export function getRedisClient(options?: RedisOptions): Redis | null {
  if (!redisClient) {
    return initRedisClient(options)
  }
  return redisClient
}

/**
 * Reset the Redis client (useful for testing or reconfiguration)
 */
export function resetRedisClient(): void {
  redisClient = null
}

/**
 * Check if Redis is configured and available
 */
export async function isRedisAvailable(): Promise<boolean> {
  const redis = getRedisClient({ enableLogging: false })
  if (!redis) return false

  try {
    // Ping Redis to check connection
    await redis.ping()
    return true
  } catch (error) {
    console.error("Redis availability check failed:", error)
    return false
  }
}
