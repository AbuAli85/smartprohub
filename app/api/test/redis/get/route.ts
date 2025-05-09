import { NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

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

    // Get the value from Redis
    const value = await redis.get(key)

    return NextResponse.json({
      status: "success",
      value,
    })
  } catch (error) {
    console.error("Redis get error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error getting Redis value",
      },
      { status: 500 },
    )
  }
}
