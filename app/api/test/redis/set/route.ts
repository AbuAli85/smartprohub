import { NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis/client"

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json()

    if (!key) {
      return NextResponse.json(
        {
          status: "error",
          message: "Key is required",
        },
        { status: 400 },
      )
    }

    const redis = getRedisClient()
    if (!redis) {
      return NextResponse.json(
        {
          status: "error",
          message: "Redis is not configured. Please check your configuration.",
        },
        { status: 503 },
      )
    }

    // Set the value in Redis
    await redis.set(key, value)

    return NextResponse.json({
      status: "success",
      message: `Successfully set value for key "${key}"`,
    })
  } catch (error) {
    console.error("Redis set error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error setting Redis value",
      },
      { status: 500 },
    )
  }
}
