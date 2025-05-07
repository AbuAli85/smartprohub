"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client"
import type { Session, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  isSupabaseReady: boolean
  clearLocalSession: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  refreshSession: async () => {},
  isSupabaseReady: false,
  clearLocalSession: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSupabaseReady, setIsSupabaseReady] = useState(false)
  const [authError, setAuthError] = useState<Error | null>(null)
  const router = useRouter()

  // Function to clear local session data
  const clearLocalSession = () => {
    setUser(null)
    setSession(null)

    // Clear any local storage items related to auth
    if (typeof window !== "undefined") {
      try {
        // Clear Supabase items from localStorage
        const localStorageKeys = Object.keys(localStorage)
        const supabaseKeys = localStorageKeys.filter((key) => key.startsWith("supabase.auth") || key.startsWith("sb-"))

        supabaseKeys.forEach((key) => {
          localStorage.removeItem(key)
        })
      } catch (error) {
        console.error("Error clearing local storage:", error)
      }
    }
  }

  const refreshSession = async () => {
    if (!isSupabaseConfigured()) return

    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error refreshing session:", error)
        setAuthError(error)
        clearLocalSession()
        return
      }

      setSession(data.session)
      setUser(data.session?.user ?? null)
    } catch (error) {
      console.error("Exception refreshing session:", error)
      setAuthError(error as Error)
      clearLocalSession()
    }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) return

    try {
      await supabase.auth.signOut()
      clearLocalSession()

      // Use router.push for client-side navigation
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      // Force clear session even if sign out fails
      clearLocalSession()
      router.push("/")
    }
  }

  // Handle auth errors
  useEffect(() => {
    if (authError) {
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
    }
  }, [authError, router])

  // Set up global error handler for debugging
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Safely log the error without causing additional errors
      try {
        console.error("Unhandled Promise Rejection in AuthProvider:", event.reason)
      } catch (e) {
        // Silently fail if console.error throws
      }
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  // Update the useEffect for session checking to prevent excessive re-renders
  useEffect(() => {
    const supabaseConfigured = isSupabaseConfigured()
    setIsSupabaseReady(supabaseConfigured)

    if (!supabaseConfigured) {
      setIsLoading(false)
      return
    }

    // Create a flag to prevent race conditions
    let isMounted = true

    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        // Only update state if component is still mounted
        if (!isMounted) return

        if (error) {
          console.error("Error getting session:", error)
          setAuthError(error)
          setIsLoading(false)
          return
        }

        setSession(data.session)
        setUser(data.session?.user ?? null)
        setIsLoading(false)
      } catch (error) {
        // Only update state if component is still mounted
        if (!isMounted) return

        console.error("Exception getting session:", error)
        setAuthError(error as Error)
        setIsLoading(false)
      }
    }

    getSession()

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        // Only update state if component is still mounted
        if (!isMounted) return

        console.log("Auth state changed:", event)
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)

        // Clear auth error when successfully signed in
        if (event === "SIGNED_IN") {
          setAuthError(null)
        }

        // Handle token refresh errors
        if (event === "TOKEN_REFRESHED") {
          setAuthError(null)
        }
      })

      return () => {
        isMounted = false
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error("Error setting up auth state change listener:", error)
      setIsLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signOut,
        refreshSession,
        isSupabaseReady,
        clearLocalSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
