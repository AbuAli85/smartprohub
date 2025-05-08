import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    // Get the SQL script content
    const scriptPath = path.join(process.cwd(), "database-setup-notifications.sql")
    const sqlScript = fs.readFileSync(scriptPath, "utf8")

    // Connect to the database
    const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || "")

    // Execute the SQL script
    await sql.query(sqlScript)

    return NextResponse.json({
      success: true,
      message: "Notifications table and triggers set up successfully",
    })
  } catch (error) {
    console.error("Error setting up notifications:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to set up notifications",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
