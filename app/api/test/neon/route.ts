import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    const { databaseUrl } = await request.json()

    if (!databaseUrl) {
      return NextResponse.json({ error: "Database URL is required" }, { status: 400 })
    }

    // Test the connection
    const sql = neon(databaseUrl)

    // Simple query to test connection
    const startTime = Date.now()
    const result = await sql`SELECT current_timestamp as time, version() as version`
    const duration = Date.now() - startTime

    return NextResponse.json({
      status: "success",
      message: "Neon connection successful",
      data: {
        server_time: result[0].time,
        version: result[0].version,
        connection_time_ms: duration,
      },
    })
  } catch (error: any) {
    console.error("Neon connection test failed:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Neon connection test failed",
        error: error.message,
        details: error.stack,
      },
      { status: 500 },
    )
  }
}
