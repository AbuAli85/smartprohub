import { NextResponse } from "next/server"
import { sql } from "@/lib/neon/client"

export async function GET() {
  try {
    // Simple query to test connection
    const result = await sql.query("SELECT current_timestamp as server_time")

    return NextResponse.json({
      status: "success",
      message: "Database connection successful",
      timestamp: new Date().toISOString(),
      server_time: result.rows[0]?.server_time,
      connection: "Neon PostgreSQL",
    })
  } catch (error: any) {
    console.error("Database connection test failed:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
