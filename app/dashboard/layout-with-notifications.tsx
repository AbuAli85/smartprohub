import type React from "react"
import { HeaderWithNotifications } from "@/components/dashboard/header-with-notifications"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderWithNotifications />
      <div className="flex flex-1">
        <Sidebar className="hidden md:block" />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
