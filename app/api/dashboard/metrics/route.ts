import { NextResponse } from "next/server"
import { getDashboardMetrics } from "@/lib/neon/analytics-service"
import { getDashboardMetrics as getRedisMetrics, storeDashboardMetrics } from "@/lib/redis/real-time-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Try to get metrics from Redis first (for faster response)
    let metrics = null
    try {
      metrics = await getRedisMetrics(userId)
    } catch (redisError) {
      console.error("Error getting metrics from Redis:", redisError)
      // Continue to try from database
    }

    // If not in Redis, get from Neon database
    if (!metrics) {
      try {
        metrics = await getDashboardMetrics(userId)

        // Store in Redis for future requests if we got valid metrics
        if (metrics && metrics.length > 0) {
          await storeDashboardMetrics(userId, metrics)
        }
      } catch (dbError) {
        console.error("Error getting metrics from database:", dbError)
        // Return default metrics on error
        return NextResponse.json([
          {
            totalBookings: 0,
            confirmedBookings: 0,
            pendingBookings: 0,
            cancelledBookings: 0,
            totalContracts: 0,
            signedContracts: 0,
            totalContractValue: 0,
          },
        ])
      }
    }

    return NextResponse.json(
      metrics || [
        {
          totalBookings: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
          totalContracts: 0,
          signedContracts: 0,
          totalContractValue: 0,
        },
      ],
    )
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error)
    return NextResponse.json(
      [
        {
          totalBookings: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
          totalContracts: 0,
          signedContracts: 0,
          totalContractValue: 0,
        },
      ],
      { status: 500 },
    )
  }
}
