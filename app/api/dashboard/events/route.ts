import { NextResponse } from "next/server"
import { getRecentEvents } from "@/lib/redis/real-time-service"
import { supabase } from "@/lib/supabase/client"

// Helper to validate JWT token
async function validateToken(token: string) {
  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
      return null
    }
    return data.user
  } catch (error) {
    console.error("Error validating token:", error)
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const token = searchParams.get("token")
  const lastEventId = searchParams.get("lastEventId")

  // Validate input
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  // Validate authentication if token is provided
  let authenticatedUserId = null
  if (token) {
    try {
      const user = await validateToken(token)
      if (user) {
        authenticatedUserId = user.id

        // Verify the user has access to the requested userId data
        if (userId !== authenticatedUserId && user.user_metadata?.role !== "admin") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      }
    } catch (error) {
      console.error("Token validation error:", error)
      // Continue without authentication
    }
  }

  // Create a readable stream for SSE
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      // Send headers and initial connection message
      controller.enqueue(encoder.encode("retry: 1000\n\n"))
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`))

      // If we have a lastEventId, try to fetch missed events
      if (lastEventId) {
        try {
          const missedEvents = await getRecentEvents(userId)
          if (missedEvents && missedEvents.length > 0) {
            for (const event of missedEvents) {
              controller.enqueue(
                encoder.encode(`event: ${event.type}\nid: ${event.id}\ndata: ${JSON.stringify(event.data)}\n\n`),
              )
            }
          }
        } catch (error) {
          console.error("Error fetching missed events:", error)
        }
      }

      // For demo purposes, we'll send periodic updates
      let eventId = 1

      // Send metrics update every 5 seconds
      const metricsInterval = setInterval(async () => {
        const metricsData = {
          totalBookings: Math.floor(Math.random() * 30) + 20,
          confirmedBookings: Math.floor(Math.random() * 20) + 15,
          pendingBookings: Math.floor(Math.random() * 10),
          cancelledBookings: Math.floor(Math.random() * 5),
          totalContracts: Math.floor(Math.random() * 20) + 10,
          signedContracts: Math.floor(Math.random() * 15) + 5,
          totalContractValue: Math.floor(Math.random() * 50000) + 20000,
        }

        controller.enqueue(
          encoder.encode(`event: metrics-update\nid: ${eventId++}\ndata: ${JSON.stringify(metricsData)}\n\n`),
        )
      }, 5000)

      // Send activity update every 8 seconds
      const activityInterval = setInterval(async () => {
        const types = ["booking", "contract", "message"]
        const statuses = ["confirmed", "pending", "cancelled", "signed", "unread"]
        const titles = [
          "Marketing Services Agreement",
          "Website Development Contract",
          "Consulting Services Agreement",
          "Social Media Management",
          "SEO Optimization Services",
        ]

        const activityData = {
          id: Math.random().toString(36).substring(2, 10),
          type: types[Math.floor(Math.random() * types.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          createdAt: new Date().toISOString(),
          title: titles[Math.floor(Math.random() * titles.length)],
        }

        controller.enqueue(
          encoder.encode(`event: activity-update\nid: ${eventId++}\ndata: ${JSON.stringify(activityData)}\n\n`),
        )
      }, 8000)

      // Clean up on close
      request.signal.addEventListener("abort", () => {
        clearInterval(metricsInterval)
        clearInterval(activityInterval)
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering for Nginx
    },
  })
}
