import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Create a version that doesn't use cookies() from next/headers
export function createServerSupabaseClient(cookieStore?: any) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}
