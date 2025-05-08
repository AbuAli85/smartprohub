import { NextResponse } from "next/server"

export async function GET() {
  // Basic validation of environment variables
  const nextAuthUrl = process.env.NEXTAUTH_URL
  const nextPublicAppUrl = process.env.NEXT_PUBLIC_APP_URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const nextAuthSecret = process.env.NEXTAUTH_SECRET

  // Perform deeper validation
  const isNextAuthUrlValid = nextAuthUrl && (nextAuthUrl.startsWith("http://") || nextAuthUrl.startsWith("https://"))

  const isNextPublicAppUrlValid =
    nextPublicAppUrl && (nextPublicAppUrl.startsWith("http://") || nextPublicAppUrl.startsWith("https://"))

  const isSupabaseUrlValid = supabaseUrl && (supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://"))

  const isSupabaseAnonKeyValid = supabaseAnonKey && supabaseAnonKey.length > 20

  const isNextAuthSecretValid = nextAuthSecret && nextAuthSecret.length >= 32

  return NextResponse.json({
    // Environment variable status
    nextAuthUrl: nextAuthUrl ? "Set" : "Not set",
    nextAuthUrlValid: isNextAuthUrlValid ? "Valid" : "Invalid format",
    nextPublicAppUrl: nextPublicAppUrl ? "Set" : "Not set",
    nextPublicAppUrlValid: isNextPublicAppUrlValid ? "Valid" : "Invalid format",
    supabaseUrl: supabaseUrl ? "Set" : "Not set",
    supabaseUrlValid: isSupabaseUrlValid ? "Valid" : "Invalid format",
    supabaseAnonKey: supabaseAnonKey ? "Set" : "Not set",
    supabaseAnonKeyValid: isSupabaseAnonKeyValid ? "Valid" : "Invalid format",
    nextAuthSecret: nextAuthSecret ? "Set" : "Not set",
    nextAuthSecretValid: isNextAuthSecretValid ? "Valid" : "Secret may be too short",
    environment: process.env.NODE_ENV || "Not set",

    // Additional information
    vercelUrl: process.env.VERCEL_URL || "Not set",
    vercelEnv: process.env.VERCEL_ENV || "Not set",

    // Timestamp for debugging
    timestamp: new Date().toISOString(),
  })
}
