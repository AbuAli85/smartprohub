import { Redis } from "@upstash/redis"

/**
 * Test Redis connection with provided credentials
 */
export async function testRedisConnection(url: string, token: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!url || !token) {
      return {
        success: false,
        error: "Missing URL or token",
      }
    }

    // Create a temporary Redis client for testing
    const redis = new Redis({
      url,
      token,
    })

    // Test key for this connection test
    const testKey = `connection-test-${Date.now()}`

    // Test basic operations
    await redis.set(testKey, "Connection test successful")
    const result = await redis.get(testKey)
    await redis.del(testKey)

    if (result !== "Connection test successful") {
      return {
        success: false,
        error: "Data verification failed",
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Redis connection test error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Get Redis client configuration from localStorage
 */
export function getRedisConfig(): { url?: string; token?: string } {
  if (typeof window === "undefined") {
    return {}
  }

  try {
    const url = localStorage.getItem("redis_url") || undefined
    const token = localStorage.getItem("redis_token") || undefined

    return { url, token }
  } catch (error) {
    console.error("Error getting Redis config from localStorage:", error)
    return {}
  }
}
