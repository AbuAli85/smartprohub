"use client"

import type React from "react"

import { useState } from "react"
import { HeaderWithNotifications } from "@/components/dashboard/header-with-notifications"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useAuth } from "@/components/auth/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export default function DashboardLayoutWithNotifications({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-40" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="flex flex-1">
          <div className="hidden border-r bg-muted/40 md:block md:w-64">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex-1 overflow-auto py-2">
                <div className="px-4 py-2">
                  <Skeleton className="h-8 w-full" />
                </div>
                <div className="px-4 py-2">
                  <Skeleton className="h-8 w-full" />
                </div>
                <div className="px-4 py-2">
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col">
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              <Skeleton className="h-8 w-48" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-[200px] rounded-lg" />
                <Skeleton className="h-[200px] rounded-lg" />
                <Skeleton className="h-[200px] rounded-lg" />
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderWithNotifications onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1">
        <div
          className={cn(
            "fixed inset-y-0 z-20 flex w-64 flex-col border-r bg-background transition-transform lg:static lg:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
        <div className="flex flex-1 flex-col">
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
