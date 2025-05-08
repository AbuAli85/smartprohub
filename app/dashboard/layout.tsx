import type { ReactNode } from "react"
import { DashboardFallback } from "@/components/dashboard/dashboard-fallback"
import { isSupabaseConfigured } from "@/lib/supabase/client"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Check if Supabase is configured
  const isConfigured = isSupabaseConfigured()

  // If Supabase is not configured, show the fallback
  if (!isConfigured) {
    return <DashboardFallback />
  }

  // Otherwise, render the dashboard layout
  return <div className="flex min-h-screen flex-col">{children}</div>
}
