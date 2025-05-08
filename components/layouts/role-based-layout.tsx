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

interface RoleBasedLayoutProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function RoleBasedLayout({ children, allowedRoles }: RoleBasedLayoutProps) {
  const { isLoading, isAuthorized, userRole } = useRoleAuth({
    allowedRoles,
    redirectTo: "/auth/login",
    loadingComponent: (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
  })

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
