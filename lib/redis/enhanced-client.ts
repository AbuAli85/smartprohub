import { Redis } from "@upstash/redis"
import { isBrowser } from "@/lib/config"

// Redis client singleton
let redisClient: Redis | null = null

// Redis connection options
interface RedisOptions {
  url?: string
  token?: string
  enableLogging?: boolean
}

/**
 * Initialize Redis client with provided options or environment variables
 */
export function initRedisClient(options?: RedisOptions): Redis | null {
  // Skip initialization if already initialized
  if (redisClient) return redisClient

  try {
    // Use provided options or fall back to environment variables
    const url = options?.url || (isBrowser() ? undefined : process.env.KV_REST_API_URL)
    const token = options?.token || (isBrowser() ? undefined : process.env.KV_REST_API_TOKEN)

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

/**
 * Enhanced Redis wrapper with additional functionality
 */
export const enhancedRedis = {
  // Store a value with optional expiration
  async set<T>(key: string, value: T, expirationSeconds?: number): Promise<boolean> {
    const redis = getRedisClient()
    if (!redis) return false

    try {
      if (expirationSeconds) {
        await redis.set(key, JSON.stringify(value), { ex: expirationSeconds })
      } else {
        await redis.set(key, JSON.stringify(value))
      }
      return true
    } catch (error) {
      console.error(`Redis set error for key ${key}:`, error)
      return false
    }
  },

  // Get a value with type safety
  async get<T>(key: string): Promise<T | null> {
    const redis = getRedisClient()
    if (!redis) return null

    try {
      const data = await redis.get(key)
      if (!data) return null
      return JSON.parse(data as string) as T
    } catch (error) {
      console.error(`Redis get error for key ${key}:`, error)
      return null
    }
  },

  // Delete a key
  async del(key: string): Promise<boolean> {
    const redis = getRedisClient()
    if (!redis) return false

    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error(`Redis delete error for key ${key}:`, error)
      return false
    }
  },

  // Check if a key exists
  async exists(key: string): Promise<boolean> {
    const redis = getRedisClient()
    if (!redis) return false

    try {
      return (await redis.exists(key)) === 1
    } catch (error) {
      console.error(`Redis exists error for key ${key}:`, error)
      return false
    }
  },

  // Set expiration on a key
  async expire(key: string, seconds: number): Promise<boolean> {
    const redis = getRedisClient()
    if (!redis) return false

    try {
      return await redis.expire(key, seconds)
    } catch (error) {
      console.error(`Redis expire error for key ${key}:`, error)
      return false
    }
  },

  // Increment a counter
  async incr(key: string): Promise<number> {
    const redis = getRedisClient()
    if (!redis) return 0

    try {
      return await redis.incr(key)
    } catch (error) {
      console.error(`Redis incr error for key ${key}:`, error)
      return 0
    }
  },

  // Add to a list
  async lpush(key: string, value: any): Promise<number> {
    const redis = getRedisClient()
    if (!redis) return 0

    try {
      return await redis.lpush(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Redis lpush error for key ${key}:`, error)
      return 0
    }
  },

  // Get list range
  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    const redis = getRedisClient()
    if (!redis) return []

    try {
      const data = await redis.lrange(key, start, stop)
      return data.map((item) => JSON.parse(item as string)) as T[]
    } catch (error) {
      console.error(`Redis lrange error for key ${key}:`, error)
      return []
    }
  },

  // Publish to a channel
  async publish(channel: string, message: any): Promise<number> {
    const redis = getRedisClient()
    if (!redis) return 0

    try {
      return await redis.publish(channel, JSON.stringify(message))
    } catch (error) {
      console.error(`Redis publish error for channel ${channel}:`, error)
      return 0
    }
  },
}
