import { NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis/client"

export async function DELETE(request: Request) {
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

    // Delete the key from Redis
    await redis.del(key)

    return NextResponse.json({
      status: "success",
      message: `Successfully deleted key "${key}"`,
    })
  } catch (error) {
    console.error("Redis delete error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error deleting Redis key",
      },
      { status: 500 },
    )
  }
}
