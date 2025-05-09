"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRoleAuth } from "@/hooks/use-role-auth"
import { AdminSidebar } from "@/components/dashboard/admin-sidebar"
import { ProviderSidebar } from "@/components/dashboard/provider-sidebar"
import { ClientSidebar } from "@/components/dashboard/client-sidebar"
import { Header } from "@/components/dashboard/header"
import { Toaster } from "@/components/ui/toaster"
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react"
import type { UserRole } from "@/lib/supabase/database.types"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"

interface RoleBasedLayoutProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function RoleBasedLayout({ children, allowedRoles }: RoleBasedLayoutProps) {
  const [loadingTime, setLoadingTime] = useState(0)
  const [showFallback, setShowFallback] = useState(false)

  // Use a more permissive approach for development/testing
  const { isLoading, isAuthorized, userRole, error, user } = useRoleAuth({
    allowedRoles,
    redirectTo: "/auth/login",
  })

  // Track loading time and show fallback UI after threshold
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isLoading) {
      const startTime = Date.now()
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        setLoadingTime(elapsed)

        // After 15 seconds of loading, show fallback UI
        if (elapsed >= 15 && !showFallback) {
          setShowFallback(true)
          console.warn("Loading taking too long - showing fallback UI")
        }
      }, 1000)
    } else {
      setLoadingTime(0)
      setShowFallback(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLoading, showFallback])

  // Handle manual refresh
  const handleManualRefresh = () => {
    // Use a more reliable refresh method
    window.location.href = window.location.pathname
  }

  // Fallback UI when loading takes too long
  if (showFallback) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Dashboard is taking longer than expected to load</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md text-center">
          This could be due to network issues or authentication delays. You can wait or try refreshing.
        </p>

        <div className="flex gap-4">
          <Button onClick={handleManualRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/auth/login")}>
            Return to Login
          </Button>
        </div>

        {/* Continue showing loading indicator */}
        <div className="mt-8 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Still trying to load... ({loadingTime}s)</span>
        </div>

        {/* Debug info - only in development */}
        {process.env.NODE_ENV !== "production" && (
          <div className="mt-8 p-4 border rounded-md max-w-md w-full bg-muted/30">
            <h3 className="text-sm font-medium mb-2">Debug Information:</h3>
            <pre className="text-xs overflow-auto p-2 bg-muted rounded">
              {JSON.stringify(
                {
                  path: window.location.pathname,
                  isLoading,
                  isAuthorized,
                  userRole,
                  hasUser: !!user,
                  error: error || "none",
                },
                null,
                2,
              )}
            </pre>
          </div>
        )}
      </div>
    )
  }

  // Regular loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading your dashboard... ({loadingTime}s)</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <div className="max-w-md text-center p-6 bg-destructive/10 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => (window.location.href = "/auth/login")}>Return to Login</Button>
        </div>
      </div>
    )
  }

  // For development/testing, allow access even if not authorized
  if (!isAuthorized && process.env.NODE_ENV !== "production") {
    console.warn("User not authorized, but allowing access in development mode")
    // Continue rendering with default role
  } else if (!isAuthorized) {
    // In production, redirect to login
    return null
  }

  // Render the appropriate sidebar based on user role
  const renderSidebar = () => {
    const role = userRole || "client" // Default to client if no role

    switch (role) {
      case "admin":
        return <AdminSidebar />
      case "provider":
        return <ProviderSidebar />
      case "client":
        return <ClientSidebar />
      default:
        return <Sidebar /> // Fallback to default sidebar
    }
  }

  return (
    <div className="h-screen overflow-hidden">
      <div className="flex h-full">
        <div className="hidden md:flex md:w-64 md:flex-col">{renderSidebar()}</div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
