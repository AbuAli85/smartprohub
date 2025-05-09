import { NextResponse } from "next/server"
import { getRedisClient, isRedisAvailable } from "@/lib/redis/client"

export async function GET(request: Request) {
  try {
    // Check if Redis is available
    const available = await isRedisAvailable()

    if (!available) {
      return NextResponse.json(
        {
          status: "error",
          message: "Redis is not available. Please check your configuration.",
          available: false,
        },
        { status: 503 },
      )
    }

    // Test key for this request
    const testKey = `redis-test-${Date.now()}`
    const testValue = { timestamp: new Date().toISOString(), test: "successful" }

    // Get Redis client
    const redis = getRedisClient()
    if (!redis) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to initialize Redis client",
          available: false,
        },
        { status: 500 },
      )
    }

    // Set a test value
    await redis.set(testKey, testValue)

    // Get the test value
    const getValue = await redis.get(testKey)
    const getSuccess = getValue !== null

    // Delete the test value
    await redis.del(testKey)

    return NextResponse.json({
      status: "success",
      message: "Redis is configured and working correctly",
      available: true,
      operations: {
        set: true,
        get: getSuccess,
        delete: true,
      },
      testValue: getValue,
    })
  } catch (error) {
    console.error("Redis test error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error testing Redis",
        available: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
