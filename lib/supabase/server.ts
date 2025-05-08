import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

// Create a server-side Supabase client
export const createServerSupabase = () => createServerComponentClient<Database>({ cookies })
