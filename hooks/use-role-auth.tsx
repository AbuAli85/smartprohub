"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"
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
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkUserRole = async () => {
      if (authLoading) return

      if (!user) {
        // Not logged in, redirect to login
        router.push(`${redirectTo}?redirectTo=${encodeURIComponent(pathname)}`)
        return
      }

      try {
        // Fetch user profile to get role
        const { data, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (error) throw error

        const role = data.role as UserRole
        setUserRole(role)

        // Check if user has an allowed role
        const hasAllowedRole = allowedRoles.includes(role)
        setIsAuthorized(hasAllowedRole)

        if (!hasAllowedRole) {
          // Redirect to appropriate dashboard based on role
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
        }
      } catch (error) {
        console.error("Error checking user role:", error)
        router.push(redirectTo)
      } finally {
        setIsLoading(false)
      }
    }

    checkUserRole()
  }, [user, authLoading, allowedRoles, redirectTo, router, pathname])

  return { isLoading, isAuthorized, userRole, user }
}
