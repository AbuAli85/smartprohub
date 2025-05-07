"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { BarChart3, Calendar, FileText, Home, MessageSquare, Settings, Users, LogOut, Clock, User } from "lucide-react"

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Bookings",
    icon: Calendar,
    href: "/dashboard/bookings",
    color: "text-violet-500",
  },
  {
    label: "Contracts",
    icon: FileText,
    href: "/dashboard/contracts",
    color: "text-pink-700",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/dashboard/messages",
    color: "text-orange-500",
  },
  {
    label: "Availability",
    icon: Clock,
    href: "/dashboard/availability",
    color: "text-emerald-500",
  },
  {
    label: "Profile",
    icon: User,
    href: "/dashboard/profile",
    color: "text-green-500",
  },
  {
    label: "Users",
    icon: Users,
    href: "/dashboard/users",
    color: "text-blue-500",
    admin: true,
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
    color: "text-yellow-500",
    admin: true,
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-gray-500",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { signOut, user } = useAuth()
  const isAdmin = user?.email === "admin@example.com" // This should be replaced with a proper role check

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-gray-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-10">
          <h1 className="text-2xl font-bold">SmartPRO</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => {
            if (route.admin && !isAdmin) return null

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-gray-800/50 rounded-lg transition",
                  pathname === route.href ? "text-white bg-gray-800" : "text-zinc-400",
                )}
              >
                <div className="flex items-center flex-1">
                  <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                  {route.label}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      <div className="px-3 py-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-zinc-400 hover:text-white hover:bg-gray-800/50"
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5 mr-3 text-red-500" />
          Logout
        </Button>
      </div>
    </div>
  )
}
