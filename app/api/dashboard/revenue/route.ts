import { NextResponse } from "next/server"
import { getRevenueData } from "@/lib/neon/analytics-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const period = (searchParams.get("period") as "week" | "month" | "year") || "month"

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const revenueData = await getRevenueData(userId, period)

    return NextResponse.json(revenueData || [])
  } catch (error) {
    console.error("Error fetching revenue data:", error)
    return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 })
  }
}
