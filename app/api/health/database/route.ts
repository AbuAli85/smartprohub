import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/neon/client"
import { supabase } from "@/lib/supabase/client"

export async function GET() {
  try {
    // Check Neon database connection
    const neonConnected = await checkDatabaseConnection()

    // Check Supabase connection
    let supabaseConnected = false
    try {
      const { data, error } = await supabase.from("_health").select("*").limit(1)
      supabaseConnected = !error
    } catch (error) {
      console.error("Supabase health check error:", error)
    }

    // Get environment variables status (without exposing values)
    const envStatus = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEON_DATABASE_URL: !!process.env.NEON_DATABASE_URL,
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      databases: {
        neon: {
          connected: neonConnected,
        },
        supabase: {
          connected: supabaseConnected,
        },
      },
      environment: envStatus,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
