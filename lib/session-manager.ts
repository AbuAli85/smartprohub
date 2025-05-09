import { supabase } from "@/lib/supabase/client"
import { getCache, setCache, removeCache } from "@/lib/cache-manager"
import { measure } from "@/lib/performance-monitoring"
import { withRetry } from "@/lib/retry-mechanism"

export type SessionStatus = "authenticated" | "unauthenticated" | "loading" | "error"

export interface SessionInfo {
  status: SessionStatus
  error?: string
  lastChecked?: Date
  expiresAt?: number
}

// Local storage keys
const SESSION_INFO_KEY = "smartpro_session_info"
const SESSION_USER_KEY = "smartpro_session_user"
const SESSION_REFRESH_SCHEDULED = "smartpro_refresh_scheduled"

// Function to check if we're in a browser environment
const isBrowser = () => typeof window !== "undefined"

// Get session info from local storage
export function getStoredSessionInfo(): SessionInfo | null {
  return getCache<SessionInfo>(SESSION_INFO_KEY)
}

// Store session info in local storage
export function storeSessionInfo(info: SessionInfo): void {
  setCache(SESSION_INFO_KEY, {
    ...info,
    lastChecked: new Date(),
  })
}

// Get stored user data
export function getStoredUser(): any | null {
  return getCache(SESSION_USER_KEY)
}

// Store user data
export function storeUser(user: any): void {
  setCache(SESSION_USER_KEY, user, { expirationMinutes: 60 })
}

// Clear stored user data
export function clearStoredUser(): void {
  removeCache(SESSION_USER_KEY)
}

// Check if session is valid
export async function checkSession(): Promise<SessionInfo> {
  return await measure("checkSession", async () => {
    try {
      // First check cache for recent session check
      const cachedInfo = getStoredSessionInfo()
      const now = Date.now()

      // If we have a recent check (less than 1 minute old), use it
      if (cachedInfo && cachedInfo.lastChecked) {
        const lastCheckedTime = new Date(cachedInfo.lastChecked).getTime()
        if (now - lastCheckedTime < 60000) {
          // 1 minute
          return cachedInfo
        }
      }

      // Otherwise, check with Supabase
      const { data, error } = await withRetry(() => supabase.auth.getSession(), {
        maxRetries: 2,
        retryableErrors: ["network", "timeout", "fetch failed"],
      })

      if (error) {
        // Handle "Auth session missing" error gracefully
        if (error.message.includes("Auth session missing")) {
          const info: SessionInfo = {
            status: "unauthenticated",
            lastChecked: new Date(),
          }
          storeSessionInfo(info)
          clearStoredUser()
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
        clearStoredUser()
        return info
      }

      // Check if session is expired
      const expiresAt = data.session.expires_at

      if (expiresAt && expiresAt * 1000 < now) {
        const info: SessionInfo = {
          status: "unauthenticated",
          error: "Session expired",
          lastChecked: new Date(),
        }
        storeSessionInfo(info)
        clearStoredUser()
        return info
      }

      // Store user data for quick access
      if (data.session.user) {
        storeUser(data.session.user)
      }

      const info: SessionInfo = {
        status: "authenticated",
        lastChecked: new Date(),
        expiresAt: expiresAt,
      }
      storeSessionInfo(info)

      // Schedule refresh if not already scheduled
      scheduleSessionRefresh(expiresAt)

      return info
    } catch (error: any) {
      console.error("Error checking session:", error)
      const info: SessionInfo = {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error checking session",
        lastChecked: new Date(),
      }
      storeSessionInfo(info)
      return info
    }
  })
}

// Calculate time until session expiry
export function getSessionTimeRemaining(): number | null {
  if (!isBrowser()) return null

  const cachedInfo = getStoredSessionInfo()
  if (!cachedInfo || !cachedInfo.expiresAt) return null

  const expiresAt = cachedInfo.expiresAt * 1000 // Convert to milliseconds
  const now = Date.now()
  const timeRemaining = expiresAt - now

  return timeRemaining > 0 ? timeRemaining : 0
}

// Schedule a session refresh before expiration
function scheduleSessionRefresh(expiresAt?: number): void {
  if (!isBrowser() || !expiresAt) return

  // Check if we already have a refresh scheduled
  const isScheduled = getCache<boolean>(SESSION_REFRESH_SCHEDULED)
  if (isScheduled) return

  const expiryTime = expiresAt * 1000
  const now = Date.now()
  const timeUntilExpiry = expiryTime - now

  // If session expires in less than 5 minutes, refresh now
  if (timeUntilExpiry < 300000) {
    refreshSession()
    return
  }

  // Otherwise, schedule refresh for 5 minutes before expiry
  const refreshDelay = timeUntilExpiry - 300000

  // Mark that we've scheduled a refresh
  setCache(SESSION_REFRESH_SCHEDULED, true, { expirationMinutes: refreshDelay / 60000 })

  setTimeout(() => {
    refreshSession()
  }, refreshDelay)
}

// Attempt to refresh the session
export async function refreshSession(): Promise<SessionInfo> {
  return await measure("refreshSession", async () => {
    try {
      // Remove the scheduled flag
      removeCache(SESSION_REFRESH_SCHEDULED)

      // First check if we have a session
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        const info: SessionInfo = {
          status: "unauthenticated",
          lastChecked: new Date(),
        }
        storeSessionInfo(info)
        clearStoredUser()
        return info
      }

      const { data, error } = await withRetry(() => supabase.auth.refreshSession(), { maxRetries: 3 })

      if (error) {
        // Handle "Auth session missing" error gracefully
        if (error.message.includes("Auth session missing")) {
          const info: SessionInfo = {
            status: "unauthenticated",
            lastChecked: new Date(),
          }
          storeSessionInfo(info)
          clearStoredUser()
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
        clearStoredUser()
        return info
      }

      // Store user data for quick access
      if (data.session.user) {
        storeUser(data.session.user)
      }

      const info: SessionInfo = {
        status: "authenticated",
        lastChecked: new Date(),
        expiresAt: data.session.expires_at,
      }
      storeSessionInfo(info)

      // Schedule the next refresh
      scheduleSessionRefresh(data.session.expires_at)

      return info
    } catch (error: any) {
      console.error("Error refreshing session:", error)
      const info: SessionInfo = {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error refreshing session",
        lastChecked: new Date(),
      }
      storeSessionInfo(info)
      return info
    }
  })
}
