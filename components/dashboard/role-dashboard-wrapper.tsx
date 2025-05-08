"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { DashboardFallback } from "@/components/dashboard/dashboard-fallback"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface RoleDashboardWrapperProps {
  children: React.ReactNode
  expectedRole: "admin" | "provider" | "client"
  fallbackUrl?: string
}

export function RoleDashboardWrapper({
  children,
  expectedRole,
  fallbackUrl = "/auth/login",
}: RoleDashboardWrapperProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isCheckingRole, setIsCheckingRole] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUserRole = async () => {
      if (!isLoading && !isAuthenticated) {
        router.push(fallbackUrl)
        return
      }

      if (!isLoading && isAuthenticated && user) {
        try {
          // Fetch the user's role from the API
          const response = await fetch("/api/system-check")

          if (!response.ok) {
            throw new Error("Failed to fetch user role")
          }

          const data = await response.json()
          setUserRole(data.auth.role)
        } catch (err) {
          console.error("Error checking user role:", err)
          setError("Failed to verify your account role. Please try again.")
        } finally {
          setIsCheckingRole(false)
        }
      }
    }

    checkUserRole()
  }, [isLoading, isAuthenticated, user, router, fallbackUrl])

  // Show loading state while checking authentication and role
  if (isLoading || isCheckingRole) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <Skeleton className="h-80 md:col-span-4 rounded-lg" />
          <Skeleton className="h-80 md:col-span-3 rounded-lg" />
        </div>
      </div>
    )
  }

  // Show error if role check failed
  if (error) {
    return <DashboardFallback error={error} />
  }

  // Show fallback if user doesn't have the expected role
  if (userRole !== expectedRole) {
    return (
      <DashboardFallback
        title="Access Denied"
        description={`This dashboard is only accessible to ${expectedRole}s. Your role is ${userRole || "unknown"}.`}
        error="You don't have permission to access this dashboard."
      />
    )
  }

  // Render the dashboard if user has the correct role
  return <>{children}</>
}
