"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const supabase = createClient<Database>(supabaseUrl, supabaseKey)

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          throw new Error("No session found")
        }

        const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        if (error) {
          throw error
        }

        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return <div>Loading profile...</div>
  }

  if (error) {
    return <div>Error loading profile: {error.message}</div>
  }

  if (!profile) {
    return <div>No profile found</div>
  }

  return (
    <div>
      <h1>Profile</h1>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </div>
  )
}
