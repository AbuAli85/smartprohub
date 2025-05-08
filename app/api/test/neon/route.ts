import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || "")

    // Simple query to test connection
    const result = await sql`SELECT current_timestamp as time, version() as version`

    return NextResponse.json({
      status: "success",
      message: "Neon connection successful",
      data: result[0],
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Neon test failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
