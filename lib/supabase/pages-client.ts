import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Create a Supabase client for use in the Pages Router
export const createPagesSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase credentials missing")
    throw new Error("Supabase credentials missing")
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
}

// Export a singleton instance for convenience in Pages Router components
export const pagesSupabase = createPagesSupabaseClient()
