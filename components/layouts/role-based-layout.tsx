"use client"

import type React from "react"

import { useRoleAuth } from "@/hooks/use-role-auth"
import { AdminSidebar } from "@/components/dashboard/admin-sidebar"
import { ProviderSidebar } from "@/components/dashboard/provider-sidebar"
import { ClientSidebar } from "@/components/dashboard/client-sidebar"
import { Header } from "@/components/dashboard/header"
import { Toaster } from "@/components/ui/toaster"
import { Loader2 } from "lucide-react"
import type { UserRole } from "@/lib/supabase/database.types"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useEffect } from "react"

interface RoleBasedLayoutProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function RoleBasedLayout({ children, allowedRoles }: RoleBasedLayoutProps) {
  const { isLoading, isAuthorized, userRole, error } = useRoleAuth({
    allowedRoles,
    redirectTo: "/auth/login",
    loadingComponent: (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
  })

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    if (isLoading) {
      timeoutId = setTimeout(() => {
        console.error("Loading timeout reached - forcing refresh")
        window.location.reload()
      }, 10000) // 10 seconds timeout
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <div className="max-w-md text-center p-6 bg-destructive/10 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <a href="/auth/login" className="text-primary hover:underline">
            Return to login
          </a>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    // The hook will handle redirection, but we'll return null to prevent rendering
    return null
  }

  // Render the appropriate sidebar based on user role
  const renderSidebar = () => {
    switch (userRole) {
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
