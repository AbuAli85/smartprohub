import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Store the client instance
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

// Check if Supabase environment variables are configured
export function isSupabaseConfigured(): boolean {
  return (
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0
  )
}

// Get or create the Supabase client
export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
    )
  }

  // Create the client if it doesn't exist
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: {
            "Content-Type": "application/json",
          },
        },
      },
    )
  }

  return supabaseInstance
}

// For backward compatibility
export const supabase = typeof window !== "undefined" && isSupabaseConfigured() ? getSupabaseClient() : null

// Add a global unhandled rejection handler for debugging
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled Promise Rejection:", event.reason)
  })
}
