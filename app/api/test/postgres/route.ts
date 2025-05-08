import { NextResponse } from "next/server"
import { sql } from "@/lib/neon/client"

export async function GET() {
  try {
    // Use tagged template literal syntax for SQL query
    const result = await sql`
      SELECT 
        NOW() as server_time, 
        current_database() as database_name,
        current_user as database_user
    `

    return NextResponse.json({
      status: "success",
      message: "Database connection successful",
      timestamp: new Date().toISOString(),
      server_time: result[0]?.server_time || new Date().toISOString(),
      database_name: result[0]?.database_name || "unknown",
      database_user: result[0]?.database_user || "unknown",
      connection: "Neon PostgreSQL",
    })
  } catch (error: any) {
    console.error("Database connection test failed:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Database connection test failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
