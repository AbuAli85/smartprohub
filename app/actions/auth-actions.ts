"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { syncProfileFromMetadataServer } from "@/lib/profile-sync"
import { revalidatePath } from "next/cache"

export async function syncUserProfile() {
  try {
    const supabase = createServerActionClient({ cookies })

    // Get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData.session) {
      return {
        success: false,
        message: "No active session found",
        error: sessionError?.message || "Not authenticated",
      }
    }

    // Sync profile
    const result = await syncProfileFromMetadataServer(sessionData.session.user.id)

    // Revalidate paths that might display profile data
    revalidatePath("/dashboard")
    revalidatePath("/profile")
    revalidatePath("/settings")

    return result
  } catch (error) {
    console.error("Error in syncUserProfile server action:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function checkAuthStatus() {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return {
        authenticated: false,
        error: error.message,
      }
    }

    return {
      authenticated: !!data.session,
      session: data.session,
      user: data.session?.user || null,
    }
  } catch (error) {
    console.error("Error checking auth status:", error)
    return {
      authenticated: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function getUserRole() {
  try {
    const supabase = createServerActionClient({ cookies })

    // Get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData.session) {
      return {
        success: false,
        role: null,
        error: sessionError?.message || "Not authenticated",
      }
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", sessionData.session.user.id)
      .single()

    if (profileError) {
      return {
        success: false,
        role: null,
        error: profileError.message,
      }
    }

    return {
      success: true,
      role: profile?.role || null,
    }
  } catch (error) {
    console.error("Error getting user role:", error)
    return {
      success: false,
      role: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
