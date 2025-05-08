import { NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis/real-time-service"
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

  // Validate authentication
  if (token) {
    const user = await validateToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // If no userId was provided, use the authenticated user's ID
    if (!userId) {
      userId = user.id as string
    }

    // Verify the user has access to the requested userId data
    if (userId !== user.id && user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } else if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  // Get Redis client
  const redis = getRedisClient()
  if (!redis) {
    return NextResponse.json({ error: "Redis client not available" }, { status: 500 })
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
          const missedEvents = await redis.lrange(`events:${userId}:missed`, 0, -1)
          if (missedEvents && missedEvents.length > 0) {
            for (const event of missedEvents) {
              const parsedEvent = JSON.parse(event as string)
              controller.enqueue(
                encoder.encode(
                  `event: ${parsedEvent.type}\nid: ${parsedEvent.id}\ndata: ${JSON.stringify(parsedEvent.data)}\n\n`,
                ),
              )
            }
            // Clear missed events after sending
            await redis.del(`events:${userId}:missed`)
          }
        } catch (error) {
          console.error("Error fetching missed events:", error)
        }
      }

      // Set up Redis pub/sub for real-time updates
      // In a production environment, you would use a more robust solution
      // This is a simplified example

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

        const eventData = {
          id: eventId++,
          type: "metrics-update",
          data: metricsData,
          timestamp: new Date().toISOString(),
        }

        // Store event for potential recovery
        await redis.lpush(`events:${userId}:recent`, JSON.stringify(eventData))
        await redis.ltrim(`events:${userId}:recent`, 0, 99) // Keep last 100 events

        controller.enqueue(
          encoder.encode(`event: metrics-update\nid: ${eventData.id}\ndata: ${JSON.stringify(metricsData)}\n\n`),
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

        const eventData = {
          id: eventId++,
          type: "activity-update",
          data: activityData,
          timestamp: new Date().toISOString(),
        }

        // Store event for potential recovery
        await redis.lpush(`events:${userId}:recent`, JSON.stringify(eventData))
        await redis.ltrim(`events:${userId}:recent`, 0, 99) // Keep last 100 events

        controller.enqueue(
          encoder.encode(`event: activity-update\nid: ${eventData.id}\ndata: ${JSON.stringify(activityData)}\n\n`),
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
