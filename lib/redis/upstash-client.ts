/**
 * Upstash Redis Client
 * This file explicitly uses the Upstash Redis integration
 */

import { Redis } from "@upstash/redis"

// Create a Redis client using Upstash
export function createUpstashRedisClient(config?: {
  url?: string
  token?: string
}) {
  // Use provided config or environment variables
  const url = config?.url || process.env.UPSTASH_REDIS_REST_URL
  const token = config?.token || process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn("Upstash Redis credentials not found")
    return null
  }

  try {
    // Create Redis client
    const redis = new Redis({
      url,
      token,
    })

    return redis
  } catch (error) {
    console.error("Error creating Upstash Redis client:", error)
    return null
  }
}

// Export default to ensure the file is included in the bundle
export default {
  createClient: createUpstashRedisClient,
}
