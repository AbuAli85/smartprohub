"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client"
import type { UserRole } from "@/lib/supabase/database.types"

type RoleAuthConfig = {
  allowedRoles: UserRole[]
  redirectTo?: string
  loadingComponent?: React.ReactNode
}

export function useRoleAuth({ allowedRoles, redirectTo = "/auth/login", loadingComponent }: RoleAuthConfig) {
  const { user, isLoading: authLoading } = useAuth()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const [fetchAttempted, setFetchAttempted] = useState(false)

  useEffect(() => {
    const checkUserRole = async () => {
      // Don't proceed if auth is still loading
      if (authLoading) return

      setFetchAttempted(true)

      // If Supabase is not configured, use demo mode
      if (!isSupabaseConfigured()) {
        console.log("Supabase not configured, using demo mode with client role")
        setUserRole("client")
        setIsAuthorized(allowedRoles.includes("client"))
        setIsLoading(false)
        return
      }

      if (!user) {
        // Not logged in, redirect to login
        console.log("No user found, redirecting to login")
        setIsLoading(false) // Set loading to false before redirect
        router.push(`${redirectTo}?redirectTo=${encodeURIComponent(pathname)}`)
        return
      }

      try {
        // Fetch user profile to get role with timeout protection
        const fetchProfilePromise = supabase.from("profiles").select("role").eq("id", user.id).single()

        // Add a timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Profile fetch timed out")), 5000),
        )

        // Race between the fetch and the timeout
        const { data, error } = (await Promise.race([
          fetchProfilePromise,
          timeoutPromise.then(() => ({ data: null, error: new Error("Timeout") })),
        ])) as any

        if (error) {
          // If there's an error fetching the profile, use a default role
          console.error("Error fetching user role:", error)
          setError("Failed to fetch user role. Using default role.")

          // Default to client role for safety
          const defaultRole: UserRole = "client"
          setUserRole(defaultRole)

          // Check if default role is allowed
          const hasAllowedRole = allowedRoles.includes(defaultRole)
          setIsAuthorized(hasAllowedRole)

          if (!hasAllowedRole) {
            // Redirect to appropriate dashboard based on default role
            setIsLoading(false) // Set loading to false before redirect
            router.push("/client/dashboard")
          } else {
            setIsLoading(false)
          }
        } else {
          // Successfully fetched the role
          const role = (data?.role as UserRole) || "client"
          setUserRole(role)

          // Check if user has an allowed role
          const hasAllowedRole = allowedRoles.includes(role)
          setIsAuthorized(hasAllowedRole)

          if (!hasAllowedRole) {
            // Redirect to appropriate dashboard based on role
            setIsLoading(false) // Set loading to false before redirect
            switch (role) {
              case "admin":
                router.push("/admin/dashboard")
                break
              case "provider":
                router.push("/provider/dashboard")
                break
              case "client":
                router.push("/client/dashboard")
                break
              default:
                router.push("/dashboard")
            }
          } else {
            setIsLoading(false)
          }
        }
      } catch (error) {
        console.error("Error checking user role:", error)
        setError("Failed to check user role. Using default role.")

        // Default to client role for safety
        const defaultRole: UserRole = "client"
        setUserRole(defaultRole)
        setIsAuthorized(allowedRoles.includes(defaultRole))
        setIsLoading(false)
      }
    }

    checkUserRole()

    // Add a safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (isLoading && fetchAttempted) {
        console.warn("Safety timeout reached - forcing loading state to complete")
        setIsLoading(false)
        setError("Authentication timed out. Please refresh the page.")
      }
    }, 8000)

    return () => clearTimeout(safetyTimeout)
  }, [user, authLoading, allowedRoles, redirectTo, router, pathname, isLoading, fetchAttempted])

  return { isLoading, isAuthorized, userRole, user, error }
}
