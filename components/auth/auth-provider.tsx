"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"
import { getCache, setCache, removeCache } from "@/lib/cache-manager"
import { measure } from "@/lib/performance-monitoring"
import { withRetry } from "@/lib/retry-mechanism"
import { getStoredUser, storeUser, checkSession, refreshSession } from "@/lib/session-manager"

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
  isInitialized: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  refreshProfile: () => Promise<Profile | null>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
  signOut: async () => {},
  refreshSession: async () => {},
  refreshProfile: async () => null,
})

// Cache keys
const PROFILE_CACHE_PREFIX = "profile_"

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch user profile with caching
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    return await measure("fetchProfile", async () => {
      try {
        // Check cache first
        const cacheKey = `${PROFILE_CACHE_PREFIX}${userId}`
        const cachedProfile = getCache<Profile>(cacheKey)

        if (cachedProfile) {
          console.debug("Using cached profile data")
          return cachedProfile
        }

        // Fetch from Supabase with retry
        const { data, error } = await withRetry(
          () =>
            supabase
              .from("profiles")
              .select("id, full_name, avatar_url, email, role") // Only select needed fields
              .eq("id", userId)
              .single(),
          {
            maxRetries: 2,
            retryableErrors: ["network", "timeout"],
          },
        )

        if (error) {
          console.warn("Error fetching profile:", error.message)
          return null
        }

        // Cache the profile data
        if (data) {
          setCache(cacheKey, data, { expirationMinutes: 15 })
        }

        return data
      } catch (error: any) {
        console.warn("Error in fetchProfile:", error.message)
        return null
      }
    })
  }

  // Refresh profile data
  const refreshProfile = async (): Promise<Profile | null> => {
    if (!user) return null

    // Clear cache first
    const cacheKey = `${PROFILE_CACHE_PREFIX}${user.id}`
    removeCache(cacheKey)

    // Fetch fresh profile
    const freshProfile = await fetchProfile(user.id)
    if (freshProfile) {
      setProfile(freshProfile)
    }

    return freshProfile
  }

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)

      // Clear all profile caches
      if (typeof window !== "undefined") {
        Object.keys(localStorage)
          .filter((key) => key.startsWith(PROFILE_CACHE_PREFIX))
          .forEach((key) => localStorage.removeItem(key))
      }
    } catch (error: any) {
      console.warn("Error signing out:", error.message)
    }
  }

  // Initialize auth state
  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      await measure("initAuth", async () => {
        try {
          // First, try to get user from cache for immediate UI rendering
          const cachedUser = getStoredUser()
          if (cachedUser && isMounted) {
            setUser(cachedUser)
            // We'll still load the profile and verify the session, but the UI can render
          }

          // Check session status
          const sessionInfo = await checkSession()

          if (!isMounted) return

          if (sessionInfo.status === "authenticated") {
            // Get session details
            const { data } = await supabase.auth.getSession()

            if (data.session) {
              setSession(data.session)
              setUser(data.session.user)

              // Fetch profile in the background
              fetchProfile(data.session.user.id).then((profileData) => {
                if (isMounted && profileData) {
                  setProfile(profileData)
                }
              })
            }
          } else {
            // Not authenticated
            setUser(null)
            setSession(null)
            setProfile(null)
          }
        } catch (error: any) {
          console.warn("Error initializing auth:", error.message)
        } finally {
          if (isMounted) {
            setIsLoading(false)
            setIsInitialized(true)
          }
        }
      })
    }

    // Set up auth state change listener
    const setupAuthListener = () => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!isMounted) return

        console.debug("Auth state changed:", event)

        if (newSession) {
          setSession(newSession)
          setUser(newSession.user)
          storeUser(newSession.user)

          // Fetch profile in the background
          fetchProfile(newSession.user.id).then((profileData) => {
            if (isMounted && profileData) {
              setProfile(profileData)
            }
          })
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
        }

        setIsLoading(false)
      })

      // Return cleanup function
      return () => {
        subscription.unsubscribe()
      }
    }

    // Initialize auth and set up listener
    initAuth()
    const cleanup = setupAuthListener()

    // Safety timeout - force loading to complete after 3 seconds
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn("Safety timeout reached in AuthProvider")
        setIsLoading(false)
        setIsInitialized(true)
      }
    }, 3000)

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      cleanup()
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isInitialized,
        signOut,
        refreshSession: async () => {
          const sessionInfo = await refreshSession()
          if (sessionInfo.status === "authenticated") {
            const { data } = await supabase.auth.getSession()
            if (data.session) {
              setSession(data.session)
              setUser(data.session.user)
            }
          }
        },
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
