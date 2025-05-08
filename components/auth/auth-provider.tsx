"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client"
import type { Session, User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ReloadIcon } from "@radix-ui/react-icons"
import { SessionTimeoutWarning } from "@/components/auth/session-timeout-warning"

// Define a type for user profile data
type UserProfile = {
  id: string
  role?: string
  full_name?: string
  email?: string
  [key: string]: any
}

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  isSupabaseReady: boolean
  clearLocalSession: () => void
  isAuthenticated: boolean
  refreshProfile: () => Promise<UserProfile | null>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
  refreshSession: async () => {},
  isSupabaseReady: false,
  clearLocalSession: () => {},
  isAuthenticated: false,
  refreshProfile: async () => null,
})

export const useAuth = () => useContext(AuthContext)

// Helper to safely parse JSON
const safeJsonParse = (str: string | null, fallback: any = null): any => {
  if (!str) return fallback
  try {
    return JSON.parse(str)
  } catch (e) {
    console.error("Error parsing JSON:", e)
    return fallback
  }
}

// Profile cache settings
const PROFILE_CACHE_KEY = "smartpro_user_profile"
const PROFILE_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSupabaseReady, setIsSupabaseReady] = useState(false)
  const [authError, setAuthError] = useState<Error | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [profileLastUpdated, setProfileLastUpdated] = useState<number | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Function to fetch user profile with caching
  const fetchUserProfile = useCallback(
    async (userId: string, forceRefresh = false) => {
      try {
        if (!isSupabaseConfigured()) return null

        // Check if we have a cached profile and it's still valid
        const now = Date.now()
        const cachedProfile = safeJsonParse(localStorage.getItem(PROFILE_CACHE_KEY))

        if (
          !forceRefresh &&
          cachedProfile &&
          cachedProfile.id === userId &&
          profileLastUpdated &&
          now - profileLastUpdated < PROFILE_CACHE_DURATION
        ) {
          setProfile(cachedProfile)
          return cachedProfile
        }

        // Fetch fresh data from the server
        const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

        if (error) {
          console.error("Error fetching user profile:", error)
          return cachedProfile || null
        }

        if (data) {
          // Store profile in state and localStorage
          setProfile(data)
          localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data))
          setProfileLastUpdated(now)
          return data
        }

        return cachedProfile || null
      } catch (error) {
        console.error("Exception fetching user profile:", error)
        return null
      }
    },
    [profileLastUpdated],
  )

  // Function to refresh profile data
  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user?.id) return null
    return await fetchUserProfile(user.id, true)
  }, [user, fetchUserProfile])

  // Function to clear local session data
  const clearLocalSession = useCallback(() => {
    try {
      setUser(null)
      setSession(null)
      setProfile(null)
      setIsAuthenticated(false)
      setProfileLastUpdated(null)

      // Clear any local storage items related to auth
      if (typeof window !== "undefined") {
        try {
          // Clear Supabase items from localStorage
          localStorage.removeItem(PROFILE_CACHE_KEY)
          localStorage.removeItem("profileLastUpdated")

          const localStorageKeys = Object.keys(localStorage)
          const supabaseKeys = localStorageKeys.filter(
            (key) => key.startsWith("supabase.auth") || key.startsWith("sb-"),
          )

          supabaseKeys.forEach((key) => {
            localStorage.removeItem(key)
          })
        } catch (error) {
          console.error("Error clearing local storage:", error)
        }
      }
    } catch (error) {
      console.error("Error in clearLocalSession:", error)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      setIsRefreshing(true)

      if (!isSupabaseConfigured()) {
        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      // First check if we have a session before trying to refresh
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        console.log("No active session to refresh")
        setIsAuthenticated(false)
        setIsRefreshing(false)

        // Don't show an error toast here, just return
        return
      }

      console.log("Refreshing session...")
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error("Error refreshing session:", error)

        // Handle "Auth session missing" error gracefully
        if (error.message.includes("Auth session missing")) {
          console.log("No auth session found, user is not logged in")
          setIsAuthenticated(false)
          clearLocalSession()

          // Don't set this as an error state
          setAuthError(null)
        } else if (error.message.includes("expired") || error.message.includes("invalid")) {
          // Only clear session if it's an expired session error
          clearLocalSession()
          toast({
            title: "Session expired",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive",
          })
          setAuthError(error)
        } else {
          setAuthError(error)
        }

        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      console.log("Session refreshed:", data.session?.user?.id || "No session")
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setIsAuthenticated(!!data.session)
      setAuthError(null)

      // Fetch user profile if session exists
      if (data.session?.user?.id) {
        await fetchUserProfile(data.session.user.id)
      }
    } catch (error) {
      console.error("Exception refreshing session:", error)
      setAuthError(error instanceof Error ? error : new Error(String(error)))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [clearLocalSession, fetchUserProfile])

  const signOut = useCallback(async () => {
    try {
      if (!isSupabaseConfigured()) {
        clearLocalSession()
        router.push("/")
        return
      }

      await supabase.auth.signOut()
      clearLocalSession()

      // Use router.push for client-side navigation
      router.push("/")

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error) {
      console.error("Error signing out:", error)
      // Force clear session even if sign out fails
      clearLocalSession()
      router.push("/")
    }
  }, [clearLocalSession, router])

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      try {
        const errorMessage = authError.message || "Authentication error occurred"

        // Check if it's a refresh token error
        if (errorMessage.includes("Refresh Token") || errorMessage.includes("session")) {
          toast({
            title: "Session expired",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive",
          })

          // Redirect to login after a short delay
          setTimeout(() => {
            router.push("/auth/login")
          }, 1500)
        } else {
          toast({
            title: "Authentication error",
            description: errorMessage,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error handling auth error:", error)
      }
    }
  }, [authError, router])

  // Set up global error handler for debugging
  useEffect(() => {
    try {
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        console.error("Unhandled Promise Rejection in AuthProvider:", event.reason || {})
        // Prevent the error from propagating
        event.preventDefault()
      }

      window.addEventListener("unhandledrejection", handleUnhandledRejection)

      return () => {
        window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      }
    } catch (error) {
      console.error("Error setting up unhandled rejection handler:", error)
    }
  }, [])

  // Update the useEffect for session checking
  useEffect(() => {
    try {
      const supabaseConfigured = isSupabaseConfigured()
      setIsSupabaseReady(supabaseConfigured)

      if (!supabaseConfigured) {
        setIsLoading(false)
        return
      }

      let isMounted = true
      let subscription: { unsubscribe: () => void } | null = null

      // Try to load profile from localStorage first for faster rendering
      if (typeof window !== "undefined") {
        const cachedProfile = safeJsonParse(localStorage.getItem(PROFILE_CACHE_KEY))
        if (cachedProfile) {
          setProfile(cachedProfile)
          setProfileLastUpdated(Number.parseInt(localStorage.getItem("profileLastUpdated") || "0", 10) || null)
        }
      }

      const getSession = async () => {
        try {
          console.log("Getting initial session...")
          const { data, error } = await supabase.auth.getSession()

          if (!isMounted) return

          if (error) {
            // Handle auth session missing error gracefully
            if (error.message.includes("Auth session missing")) {
              console.log("No auth session found, user is not logged in")
              setIsAuthenticated(false)
            } else {
              console.error("Error getting session:", error)
              setAuthError(error)
            }

            setIsLoading(false)
            return
          }

          console.log("Initial session:", data.session?.user?.id || "No session")
          setSession(data.session)
          setUser(data.session?.user ?? null)
          setIsAuthenticated(!!data.session)

          // Fetch user profile if session exists
          if (data.session?.user?.id) {
            await fetchUserProfile(data.session.user.id)
          }

          setIsLoading(false)
        } catch (error) {
          if (!isMounted) return
          console.error("Exception getting session:", error)
          setAuthError(error instanceof Error ? error : new Error(String(error)))
          setIsLoading(false)
        }
      }

      getSession()

      // Set up auth state change listener with better error handling
      try {
        console.log("Setting up auth state change listener...")
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!isMounted) return

          console.log("Auth state changed:", event, session?.user?.id || "No user")

          // Handle different auth events
          switch (event) {
            case "SIGNED_IN":
              setSession(session)
              setUser(session?.user ?? null)
              setIsAuthenticated(!!session)
              setAuthError(null)

              // Fetch user profile on sign in
              if (session?.user?.id) {
                await fetchUserProfile(session.user.id)
              }
              break

            case "SIGNED_OUT":
              clearLocalSession()
              break

            case "TOKEN_REFRESHED":
              setSession(session)
              setUser(session?.user ?? null)
              setIsAuthenticated(!!session)
              setAuthError(null)
              break

            case "USER_UPDATED":
              setSession(session)
              setUser(session?.user ?? null)
              // Refresh profile data
              if (session?.user?.id) {
                await fetchUserProfile(session.user.id)
              }
              break
          }

          setIsLoading(false)
        })

        subscription = data.subscription
      } catch (error) {
        console.error("Error setting up auth state change listener:", error)
        setIsLoading(false)
      }

      return () => {
        isMounted = false
        if (subscription) {
          try {
            subscription.unsubscribe()
          } catch (error) {
            console.error("Error unsubscribing from auth state changes:", error)
          }
        }
      }
    } catch (error) {
      console.error("Error in auth session effect:", error)
      setIsLoading(false)
    }
  }, [clearLocalSession, fetchUserProfile])

  // Save profile last updated timestamp to localStorage
  useEffect(() => {
    if (profileLastUpdated) {
      localStorage.setItem("profileLastUpdated", profileLastUpdated.toString())
    }
  }, [profileLastUpdated])

  // Render auth error UI if there's an error
  if (authError && !isLoading && !authError.message.includes("Auth session missing")) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{authError.message || "There was a problem with your authentication."}</AlertDescription>
        </Alert>

        <div className="flex gap-2 mt-4">
          <Button onClick={refreshSession} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh Session"
            )}
          </Button>

          <Button variant="outline" onClick={() => router.push("/auth/login")}>
            Go to Login
          </Button>
        </div>

        {children}
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signOut,
        refreshSession,
        isSupabaseReady,
        clearLocalSession,
        isAuthenticated,
        refreshProfile,
      }}
    >
      {children}
      {isAuthenticated && <SessionTimeoutWarning />}
    </AuthContext.Provider>
  )
}
