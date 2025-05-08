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
    let metrics = await getRedisMetrics(userId)

    // If not in Redis, get from Neon database
    if (!metrics) {
      metrics = await getDashboardMetrics(userId)

      // Store in Redis for future requests
      if (metrics) {
        await storeDashboardMetrics(userId, metrics)
      }
    }

    return NextResponse.json(
      metrics || {
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        totalContracts: 0,
        signedContracts: 0,
        totalContractValue: 0,
      },
    )
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard metrics" }, { status: 500 })
  }
}
