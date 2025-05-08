import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

export async function GET() {
  try {
    // Create Redis client
    const redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })

    // Test connection with a simple ping
    const pingResult = await redis.ping()

    // Set a test value
    const testKey = "test_connection_" + Date.now()
    await redis.set(testKey, "Connection successful")
    const testValue = await redis.get(testKey)

    // Clean up
    await redis.del(testKey)

    return NextResponse.json({
      status: "success",
      message: "Redis connection successful",
      ping: pingResult,
      testValue,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Redis test failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
