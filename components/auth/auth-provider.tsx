"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

type Profile = {
  id: string
  full_name?: string
  avatar_url?: string
  email?: string
  role?: string
}

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
  refreshSession: async () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [initAttempted, setInitAttempted] = useState(false)

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in fetchProfile:", error)
      return null
    }
  }

  // Refresh session
  const refreshSession = async () => {
    try {
      const {
        data: { session: newSession },
      } = await supabase.auth.getSession()

      if (newSession) {
        setSession(newSession)
        setUser(newSession.user)

        const profile = await fetchProfile(newSession.user.id)
        setProfile(profile)
      }
    } catch (error) {
      console.error("Error refreshing session:", error)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      setInitAttempted(true)

      try {
        // Get initial session
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()

        if (initialSession) {
          setSession(initialSession)
          setUser(initialSession.user)

          const profile = await fetchProfile(initialSession.user.id)
          setProfile(profile)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }

      // Set up auth state change listener
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (newSession) {
          setSession(newSession)
          setUser(newSession.user)

          const profile = await fetchProfile(newSession.user.id)
          setProfile(profile)
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
        }

        setIsLoading(false)
      })

      // Clean up subscription
      return () => {
        subscription.unsubscribe()
      }
    }

    initAuth()

    // Add a safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (isLoading && initAttempted) {
        console.warn("Auth provider safety timeout reached - forcing loading state to complete")
        setIsLoading(false)
      }
    }, 5000)

    return () => clearTimeout(safetyTimeout)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
