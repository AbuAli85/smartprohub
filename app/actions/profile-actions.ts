"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function syncUserMetadataToProfile() {
  const supabase = createServerActionClient({ cookies })

  try {
    // Get the current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData.session) {
      console.error("Error getting session:", sessionError)
      return { success: false, error: "No active session" }
    }

    const user = sessionData.session.user
    const userMetadataRole = user.user_metadata?.role as string | undefined

    if (!userMetadataRole) {
      return { success: false, error: "No role found in user metadata" }
    }

    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error checking profile:", profileError)
    }

    // Update or create profile
    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      role: userMetadataRole,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      email: user.email,
      updated_at: new Date().toISOString(),
    })

    if (upsertError) {
      console.error("Error updating profile:", upsertError)
      return { success: false, error: upsertError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error syncing user metadata to profile:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
