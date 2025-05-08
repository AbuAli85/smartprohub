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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSupabaseReady, setIsSupabaseReady] = useState(false)
  const [authError, setAuthError] = useState<Error | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Function to fetch user profile
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      if (!isSupabaseConfigured()) return null

      // First try to get from localStorage for immediate display
      const cachedProfile = safeJsonParse(localStorage.getItem("userProfile"))
      if (cachedProfile && cachedProfile.id === userId) {
        setProfile(cachedProfile)
      }

      // Then fetch fresh data from the server
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return cachedProfile || null
      }

      if (data) {
        // Store profile in state and localStorage
        setProfile(data)
        localStorage.setItem("userProfile", JSON.stringify(data))
        return data
      }

      return cachedProfile || null
    } catch (error) {
      console.error("Exception fetching user profile:", error)
      return null
    }
  }, [])

  // Function to clear local session data
  const clearLocalSession = useCallback(() => {
    try {
      setUser(null)
      setSession(null)
      setProfile(null)
      setIsAuthenticated(false)

      // Clear any local storage items related to auth
      if (typeof window !== "undefined") {
        try {
          // Clear Supabase items from localStorage
          localStorage.removeItem("userProfile")

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

      console.log("Refreshing session...")
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error("Error refreshing session:", error)
        setAuthError(error)

        // Only clear session if it's an expired session error
        if (error.message.includes("expired") || error.message.includes("invalid")) {
          clearLocalSession()
          toast({
            title: "Session expired",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive",
          })
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
      } else {
        toast({
          title: "Session refresh failed",
          description: "No session found. Please sign in again.",
          variant: "destructive",
        })
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
        const cachedProfile = safeJsonParse(localStorage.getItem("userProfile"))
        if (cachedProfile) {
          setProfile(cachedProfile)
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

  // Render auth error UI if there's an error
  if (authError && !isLoading && authError.message !== "Auth session missing!") {
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
      }}
    >
      {children}
      {isAuthenticated && <SessionTimeoutWarning />}
    </AuthContext.Provider>
  )
}
