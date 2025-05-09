"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

// Create a type for the auth context
type AuthContextType = {
  user: any | null
  session: any | null
  loading: boolean
  error: Error | null
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
}

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  signIn: async () => ({}),
  signOut: async () => {},
})

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext)

// Create the auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [session, setSession] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Create a Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  // Function to sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  // Function to sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Effect to get the initial session and set up auth state listener
  useEffect(() => {
    let mounted = true

    async function getInitialSession() {
      try {
        setLoading(true)
        const { data, error } = await supabase.auth.getSession()

        if (mounted) {
          if (error) {
            setError(error)
          } else {
            setSession(data.session)
            setUser(data.session?.user || null)
          }
        }
      } catch (error) {
        if (mounted) {
          setError(error instanceof Error ? error : new Error("Unknown error"))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setSession(session)
        setUser(session?.user || null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Provide the auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
