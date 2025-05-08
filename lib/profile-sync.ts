import { supabase } from "@/lib/supabase/client"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export type ProfileSyncResult = {
  success: boolean
  message: string
  profile?: any
  error?: any
}

/**
 * Synchronizes user metadata with profile data on the client side
 */
export async function syncProfileFromMetadata(): Promise<ProfileSyncResult> {
  try {
    // Get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData.session) {
      return {
        success: false,
        message: "No active session found",
        error: sessionError?.message || "Not authenticated",
      }
    }

    const user = sessionData.session.user

    // Extract data from user metadata
    const {
      full_name = user.user_metadata?.name || user.user_metadata?.fullName,
      avatar_url = user.user_metadata?.picture || user.user_metadata?.avatar_url,
      role = user.user_metadata?.role || "client", // Default to client if no role specified
    } = user.user_metadata || {}

    // Update profile with user metadata
    const { data: profile, error: updateError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name,
        avatar_url,
        role,
        email: user.email,
        email_confirmed: user.user_metadata?.email_verified || true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id", returning: "representation" },
    )

    if (updateError) {
      return {
        success: false,
        message: "Failed to update profile",
        error: updateError.message,
      }
    }

    return {
      success: true,
      message: "Profile synchronized successfully",
      profile: profile?.[0] || null,
    }
  } catch (error) {
    console.error("Profile sync error:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Server-side function to synchronize user metadata with profile
 */
export async function syncProfileFromMetadataServer(userId?: string): Promise<ProfileSyncResult> {
  try {
    const supabaseServer = createServerActionClient({ cookies })

    // If no userId provided, get it from the session
    if (!userId) {
      const { data: sessionData, error: sessionError } = await supabaseServer.auth.getSession()

      if (sessionError || !sessionData.session) {
        return {
          success: false,
          message: "No active session found",
          error: sessionError?.message || "Not authenticated",
        }
      }

      userId = sessionData.session.user.id
    }

    // Get user data
    const { data: userData, error: userError } = await supabaseServer.auth.admin.getUserById(userId)

    if (userError || !userData.user) {
      return {
        success: false,
        message: "User not found",
        error: userError?.message || "User not found",
      }
    }

    const user = userData.user

    // Extract data from user metadata
    const {
      full_name = user.user_metadata?.name || user.user_metadata?.fullName,
      avatar_url = user.user_metadata?.picture || user.user_metadata?.avatar_url,
      role = user.user_metadata?.role || "client", // Default to client if no role specified
    } = user.user_metadata || {}

    // Update profile with user metadata
    const { data: profile, error: updateError } = await supabaseServer.from("profiles").upsert(
      {
        id: user.id,
        full_name,
        avatar_url,
        role,
        email: user.email,
        email_confirmed: user.user_metadata?.email_verified || true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id", returning: "representation" },
    )

    if (updateError) {
      return {
        success: false,
        message: "Failed to update profile",
        error: updateError.message,
      }
    }

    return {
      success: true,
      message: "Profile synchronized successfully",
      profile: profile?.[0] || null,
    }
  } catch (error) {
    console.error("Server profile sync error:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
