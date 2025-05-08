"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient, type User, type Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

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

// Create a direct Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export const AuthProviderDirect = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

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
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)

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
  }, [router])

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
