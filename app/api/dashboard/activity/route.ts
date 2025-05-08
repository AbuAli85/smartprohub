import { NextResponse } from "next/server"
import { getRecentActivity } from "@/lib/neon/analytics-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const activityData = await getRecentActivity(userId, limit)

    // Add some debugging information
    console.log(`Retrieved ${activityData.length} activity records for user ${userId}`)

    return NextResponse.json(activityData || [])
  } catch (error) {
    console.error("Error fetching activity data:", error)
    return NextResponse.json({ error: "Failed to fetch activity data" }, { status: 500 })
  }
}
