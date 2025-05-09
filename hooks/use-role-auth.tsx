"use client"

import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client"
import type { UserRole } from "@/lib/supabase/database.types"
import { getCache, setCache } from "@/lib/cache-manager"
import { measure } from "@/lib/performance-monitoring"
import { withRetry } from "@/lib/retry-mechanism"
import { isDevelopment } from "@/lib/config"

type RoleAuthConfig = {
  allowedRoles: UserRole[]
  redirectTo?: string
  loadingComponent?: React.ReactNode
}

// Cache keys
const ROLE_CACHE_PREFIX = "user_role_"

export function useRoleAuth({ allowedRoles, redirectTo = "/auth/login" }: RoleAuthConfig) {
  const { user, isLoading: authLoading, isInitialized } = useAuth()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Function to fetch user role with caching
  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole | null> => {
    return await measure("fetchUserRole", async () => {
      try {
        // Check cache first
        const cacheKey = `${ROLE_CACHE_PREFIX}${userId}`
        const cachedRole = getCache<UserRole>(cacheKey)

        if (cachedRole) {
          console.debug("Using cached user role")
          return cachedRole
        }

        // Fetch from Supabase with retry
        const { data, error } = await withRetry(
          () => supabase.from("profiles").select("role").eq("id", userId).single(),
          {
            maxRetries: 2,
            delayMs: 200,
            retryableErrors: ["network", "timeout"],
          },
        )

        if (error) {
          console.warn("Error fetching user role:", error.message)
          return null
        }

        const role = data?.role as UserRole

        // Cache the role
        if (role) {
          setCache(cacheKey, role, { expirationMinutes: 15 })
        }

        return role
      } catch (error: any) {
        console.warn("Error in fetchUserRole:", error.message)
        return null
      }
    })
  }, [])

  useEffect(() => {
    isMountedRef.current = true

    const checkUserRole = async () => {
      await measure("checkUserRole", async () => {
        try {
          // Don't proceed if auth is still loading and not initialized
          if (authLoading && !isInitialized) return

          // If Supabase is not configured or in development, use demo mode
          if (!isSupabaseConfigured() || isDevelopment()) {
            console.log("Using demo mode with client role (Supabase not configured or in development)")

            if (!isMountedRef.current) return

            // Set default role and authorization
            const defaultRole: UserRole = "client"
            setUserRole(defaultRole)
            setIsAuthorized(allowedRoles.includes(defaultRole))
            setIsLoading(false)
            return
          }

          if (!user) {
            // Not logged in, redirect to login
            console.log("No user found, redirecting to login")
            if (!isMountedRef.current) return

            setIsLoading(false)
            router.push(`${redirectTo}?redirectTo=${encodeURIComponent(pathname)}`)
            return
          }

          // Fetch user role
          const role = await fetchUserRole(user.id)

          if (!isMountedRef.current) return

          if (role) {
            setUserRole(role)
            setIsAuthorized(allowedRoles.includes(role))
          } else {
            // Default to client role if no role found
            console.warn("No role found for user, defaulting to client")
            const defaultRole: UserRole = "client"
            setUserRole(defaultRole)
            setIsAuthorized(allowedRoles.includes(defaultRole))
          }

          setIsLoading(false)
        } catch (error: any) {
          console.error("Error in checkUserRole:", error.message)
          if (!isMountedRef.current) return

          setError(`Authentication error: ${error.message}`)

          // Default to client role on error
          const defaultRole: UserRole = "client"
          setUserRole(defaultRole)
          setIsAuthorized(allowedRoles.includes(defaultRole))

          setIsLoading(false)
        }
      })
    }

    checkUserRole()

    // Safety timeout - force loading to complete after 3 seconds
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && isLoading) {
        console.warn("Safety timeout reached in useRoleAuth")
        setIsLoading(false)

        // Default to client role as fallback
        if (!userRole) {
          setUserRole("client")
          setIsAuthorized(allowedRoles.includes("client"))
        }
      }
    }, 3000)

    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [user, authLoading, allowedRoles, redirectTo, router, pathname, isInitialized, fetchUserRole, isLoading, userRole])

  // Effect to handle unauthorized access
  useEffect(() => {
    if (!isLoading && userRole && !isAuthorized) {
      console.log(`User with role ${userRole} is not authorized to access this page`)

      // Redirect to appropriate dashboard based on role
      switch (userRole) {
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
    }
  }, [isLoading, isAuthorized, userRole, router])

  return { isLoading, isAuthorized, userRole, user, error }
}
