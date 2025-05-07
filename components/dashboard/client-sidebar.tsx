"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { Calendar, FileText, Home, MessageSquare, Settings, LogOut, User, CreditCard, HelpCircle } from "lucide-react"

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/client/dashboard",
    color: "text-sky-500",
  },
  {
    label: "My Bookings",
    icon: Calendar,
    href: "/client/bookings",
    color: "text-violet-500",
  },
  {
    label: "My Contracts",
    icon: FileText,
    href: "/client/contracts",
    color: "text-pink-700",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/client/messages",
    color: "text-orange-500",
  },
  {
    label: "Billing",
    icon: CreditCard,
    href: "/client/billing",
    color: "text-green-500",
  },
  {
    label: "Profile",
    icon: User,
    href: "/client/profile",
    color: "text-indigo-500",
  },
  {
    label: "Support",
    icon: HelpCircle,
    href: "/client/support",
    color: "text-yellow-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/client/settings",
    color: "text-gray-500",
  },
]

export function ClientSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-gray-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/client/dashboard" className="flex items-center pl-3 mb-10">
          <h1 className="text-2xl font-bold">SmartPRO</h1>
          <span className="ml-2 text-xs bg-green-500 text-white px-1 rounded">CLIENT</span>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
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
          ))}
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
