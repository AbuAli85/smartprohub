import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Create a server-side Supabase client that doesn't use next/headers
export const createServerCompatClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient<Database>(supabaseUrl, supabaseKey)
}
