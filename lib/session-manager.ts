import { supabase } from "@/lib/supabase/client"

export type SessionStatus = "authenticated" | "unauthenticated" | "loading" | "error"

export interface SessionInfo {
  status: SessionStatus
  error?: string
  lastChecked?: Date
}

// Local storage key for session info
const SESSION_INFO_KEY = "smartpro_session_info"

// Function to check if we're in a browser environment
const isBrowser = () => typeof window !== "undefined"

// Get session info from local storage
export function getStoredSessionInfo(): SessionInfo | null {
  if (!isBrowser()) return null

  try {
    const storedInfo = localStorage.getItem(SESSION_INFO_KEY)
    if (!storedInfo) return null

    return JSON.parse(storedInfo) as SessionInfo
  } catch (error) {
    console.error("Error retrieving session info from storage:", error)
    return null
  }
}

// Store session info in local storage
export function storeSessionInfo(info: SessionInfo): void {
  if (!isBrowser()) return

  try {
    localStorage.setItem(
      SESSION_INFO_KEY,
      JSON.stringify({
        ...info,
        lastChecked: new Date(),
      }),
    )
  } catch (error) {
    console.error("Error storing session info:", error)
  }
}

// Check if session is valid
export async function checkSession(): Promise<SessionInfo> {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      // Handle "Auth session missing" error gracefully
      if (error.message.includes("Auth session missing")) {
        const info: SessionInfo = {
          status: "unauthenticated",
          lastChecked: new Date(),
        }
        storeSessionInfo(info)
        return info
      }

      const info: SessionInfo = {
        status: "error",
        error: error.message,
        lastChecked: new Date(),
      }
      storeSessionInfo(info)
      return info
    }

    if (!data.session) {
      const info: SessionInfo = {
        status: "unauthenticated",
        lastChecked: new Date(),
      }
      storeSessionInfo(info)
      return info
    }

    // Check if session is expired
    const expiresAt = data.session.expires_at
    const now = Math.floor(Date.now() / 1000)

    if (expiresAt && expiresAt < now) {
      const info: SessionInfo = {
        status: "unauthenticated",
        error: "Session expired",
        lastChecked: new Date(),
      }
      storeSessionInfo(info)
      return info
    }

    const info: SessionInfo = {
      status: "authenticated",
      lastChecked: new Date(),
    }
    storeSessionInfo(info)
    return info
  } catch (error) {
    console.error("Error checking session:", error)
    const info: SessionInfo = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error checking session",
      lastChecked: new Date(),
    }
    storeSessionInfo(info)
    return info
  }
}

// Calculate time until session expiry
export function getSessionTimeRemaining(): number | null {
  if (!isBrowser()) return null

  try {
    // Use the getSession method instead of directly accessing the session
    const session = supabase.auth.session?.()
    if (!session || !session.expires_at) return null

    const expiresAt = session.expires_at * 1000 // Convert to milliseconds
    const now = Date.now()
    const timeRemaining = expiresAt - now

    return timeRemaining > 0 ? timeRemaining : 0
  } catch (error) {
    console.error("Error calculating session time remaining:", error)
    return null
  }
}

// Attempt to refresh the session
export async function refreshSession(): Promise<SessionInfo> {
  try {
    // First check if we have a session
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session) {
      const info: SessionInfo = {
        status: "unauthenticated",
        lastChecked: new Date(),
      }
      storeSessionInfo(info)
      return info
    }

    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      // Handle "Auth session missing" error gracefully
      if (error.message.includes("Auth session missing")) {
        const info: SessionInfo = {
          status: "unauthenticated",
          lastChecked: new Date(),
        }
        storeSessionInfo(info)
        return info
      }

      const info: SessionInfo = {
        status: "error",
        error: error.message,
        lastChecked: new Date(),
      }
      storeSessionInfo(info)
      return info
    }

    if (!data.session) {
      const info: SessionInfo = {
        status: "unauthenticated",
        lastChecked: new Date(),
      }
      storeSessionInfo(info)
      return info
    }

    const info: SessionInfo = {
      status: "authenticated",
      lastChecked: new Date(),
    }
    storeSessionInfo(info)
    return info
  } catch (error) {
    console.error("Error refreshing session:", error)
    const info: SessionInfo = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error refreshing session",
      lastChecked: new Date(),
    }
    storeSessionInfo(info)
    return info
  }
}
