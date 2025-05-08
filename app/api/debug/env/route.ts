import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check for essential environment variables
    const envVariables = {
      nextAuthUrl: process.env.NEXTAUTH_URL || null,
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL || null,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null,
      supabaseServiceRole: process.env.SUPABASE_SERVICE_KEY ? "Set" : null,
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(envVariables)
  } catch (error) {
    console.error("Error in env debug route:", error)
    return NextResponse.json(
      {
        error: "Failed to check environment variables",
      },
      { status: 500 },
    )
  }
}
