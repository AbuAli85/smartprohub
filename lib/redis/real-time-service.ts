import { Redis } from "@upstash/redis"

// Redis client for real-time updates
let redisClient: Redis | null = null

export function getRedisClient() {
  if (!redisClient) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn("Redis environment variables are not set")
      return null
    }

    try {
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    } catch (error) {
      console.error("Failed to initialize Redis client:", error)
      return null
    }
  }

  return redisClient
}

// Channel names for different real-time updates
export const CHANNELS = {
  BOOKING_UPDATES: "booking-updates",
  CONTRACT_UPDATES: "contract-updates",
  MESSAGE_UPDATES: "message-updates",
  METRICS_UPDATES: "metrics-updates",
}

// Publish an update to a channel
export async function publishUpdate(channel: string, data: any): Promise<boolean> {
  const redis = getRedisClient()
  if (!redis) return false

  try {
    // Add timestamp to the data
    const payload = {
      ...data,
      timestamp: new Date().toISOString(),
    }

    await redis.publish(channel, JSON.stringify(payload))
    return true
  } catch (error) {
    console.error(`Error publishing to ${channel}:`, error)
    return false
  }
}

// Store dashboard metrics in Redis with expiration
export async function storeDashboardMetrics(userId: string, metrics: any): Promise<boolean> {
  const redis = getRedisClient()
  if (!redis) return false

  try {
    // Store with 1 hour expiration
    await redis.set(`dashboard:metrics:${userId}`, JSON.stringify(metrics), { ex: 3600 })
    return true
  } catch (error) {
    console.error("Error storing dashboard metrics:", error)
    return false
  }
}

// Get dashboard metrics from Redis
export async function getDashboardMetrics(userId: string): Promise<any | null> {
  const redis = getRedisClient()
  if (!redis) return null

  try {
    const data = await redis.get(`dashboard:metrics:${userId}`)
    return data ? JSON.parse(data as string) : null
  } catch (error) {
    console.error("Error getting dashboard metrics:", error)
    return null
  }
}

// Store recent events for recovery
export async function storeEvent(userId: string, eventType: string, eventData: any): Promise<boolean> {
  const redis = getRedisClient()
  if (!redis) return false

  try {
    const event = {
      id: Date.now().toString(),
      type: eventType,
      data: eventData,
      timestamp: new Date().toISOString(),
    }

    await redis.lpush(`events:${userId}:recent`, JSON.stringify(event))
    await redis.ltrim(`events:${userId}:recent`, 0, 99) // Keep last 100 events
    return true
  } catch (error) {
    console.error("Error storing event:", error)
    return false
  }
}

// Get recent events for recovery
export async function getRecentEvents(userId: string, limit = 100): Promise<any[]> {
  const redis = getRedisClient()
  if (!redis) return []

  try {
    const events = await redis.lrange(`events:${userId}:recent`, 0, limit - 1)
    return events ? events.map((e) => JSON.parse(e as string)) : []
  } catch (error) {
    console.error("Error getting recent events:", error)
    return []
  }
}
