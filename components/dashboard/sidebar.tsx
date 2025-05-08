"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import {
  BarChart3,
  Calendar,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Users,
  LogOut,
  Clock,
  User,
  Bug,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  {
    label: "Debug",
    href: "/debug/supabase",
    icon: Bug,
    color: "text-red-500",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { signOut, user } = useAuth()
  const isAdmin = user?.email === "admin@example.com" // This should be replaced with a proper role check

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <Link href="/dashboard" className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            SmartPRO
          </h1>
        </Link>
      </div>

      <ScrollArea className="flex-1 py-2">
        <div className="px-3 space-y-1">
          {routes.map((route) => {
            if (route.admin && !isAdmin) return null

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
                  pathname === route.href
                    ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
                    : "text-gray-500 dark:text-gray-400",
                )}
              >
                <route.icon className={cn("h-5 w-5", route.color)} />
                <span>{route.label}</span>
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5 mr-3 text-red-500" />
          Logout
        </Button>
      </div>
    </div>
  )
}
