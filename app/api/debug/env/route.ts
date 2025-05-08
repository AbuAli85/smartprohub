import { NextResponse } from "next/server"

export async function GET() {
  // Only return non-sensitive environment variables
  return NextResponse.json({
    nextAuthUrl: process.env.NEXTAUTH_URL ? "Set" : "Not set",
    nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL ? "Set" : "Not set",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
    environment: process.env.NODE_ENV || "Not set",
    timestamp: new Date().toISOString(),
  })
}
