import { NextResponse } from "next/server"
import { getDashboardSettings, saveDashboardSettings } from "@/lib/dashboard/dashboard-settings"
import { supabase } from "@/lib/supabase/client"

// Get dashboard settings
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    // Verify authentication
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the user has access to the requested userId data
    const currentUserId = sessionData.session.user.id
    const userRole = sessionData.session.user.user_metadata?.role

    if (userId !== currentUserId && userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const settings = await getDashboardSettings(userId)
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching dashboard settings:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard settings" }, { status: 500 })
  }
}

// Save dashboard settings
export async function POST(request: Request) {
  try {
    const { userId, settings } = await request.json()

    if (!userId || !settings) {
      return NextResponse.json({ error: "User ID and settings are required" }, { status: 400 })
    }

    // Verify authentication
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the user has access to the requested userId data
    const currentUserId = sessionData.session.user.id
    const userRole = sessionData.session.user.user_metadata?.role

    if (userId !== currentUserId && userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const success = await saveDashboardSettings(userId, settings)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to save dashboard settings" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error saving dashboard settings:", error)
    return NextResponse.json({ error: "Failed to save dashboard settings" }, { status: 500 })
  }
}
