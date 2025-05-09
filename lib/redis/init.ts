import { getRedisClient } from "./client"

/**
 * Initialize Redis at application startup
 * This ensures Redis is properly recognized as integrated
 */
export function initializeRedis() {
  // Try to initialize Redis client from stored credentials
  if (typeof window !== "undefined") {
    try {
      const url = localStorage.getItem("redis_url")
      const token = localStorage.getItem("redis_token")

      if (url && token) {
        const redis = getRedisClient({
          url,
          token,
          enableLogging: true,
        })

        if (redis) {
          console.log("Redis initialized from stored credentials")
          return true
        }
      }
    } catch (error) {
      console.error("Error initializing Redis:", error)
    }
  }

  // Try to initialize from environment variables
  const redis = getRedisClient({ enableLogging: true })
  return !!redis
}

// Export a flag to indicate Redis is integrated
export const REDIS_INTEGRATED = true
