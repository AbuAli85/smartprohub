import { Redis } from "@upstash/redis"

// Create Redis client
let redisClient: Redis | null = null

export function getRedisClient() {
  if (!redisClient) {
    // Check if Redis URL and token are available
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn("Redis environment variables are not set")
      return null
    }

    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }

  return redisClient
}

// Helper function to store message in Redis
export async function storeMessage(messageId: string, message: any) {
  const redis = getRedisClient()
  if (!redis) return false

  try {
    // Store message with expiration (7 days)
    await redis.set(`message:${messageId}`, JSON.stringify(message), { ex: 60 * 60 * 24 * 7 })

    // Add to recipient's unread messages list
    await redis.lpush(`unread:${message.recipient_id}`, messageId)

    return true
  } catch (error) {
    console.error("Error storing message in Redis:", error)
    return false
  }
}

// Helper function to get unread message count
export async function getUnreadMessageCount(userId: string): Promise<number> {
  const redis = getRedisClient()
  if (!redis) return 0

  try {
    return await redis.llen(`unread:${userId}`)
  } catch (error) {
    console.error("Error getting unread message count:", error)
    return 0
  }
}

// Helper function to mark message as read
export async function markMessageAsRead(userId: string, messageId: string): Promise<boolean> {
  const redis = getRedisClient()
  if (!redis) return false

  try {
    await redis.lrem(`unread:${userId}`, 1, messageId)
    return true
  } catch (error) {
    console.error("Error marking message as read:", error)
    return false
  }
}
