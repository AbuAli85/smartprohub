import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { databaseUrl } = await request.json()

    if (!databaseUrl) {
      return NextResponse.json({ error: "Database URL is required" }, { status: 400 })
    }

    // In a real production environment, you would use Vercel's API to set environment variables
    // For this demo, we'll simulate success but note that this won't actually set the env var

    // Store in session storage as a temporary solution
    // Note: This is NOT persistent across server restarts and is just for demonstration
    if (typeof globalThis.sessionStorage !== "undefined") {
      sessionStorage.setItem("TEMP_DATABASE_URL", databaseUrl)
    }

    return NextResponse.json({
      status: "success",
      message: "Database URL saved (simulated)",
      note: "In a production environment, this would call Vercel's API to set the environment variable",
    })
  } catch (error: any) {
    console.error("Failed to set database URL:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to set database URL",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
