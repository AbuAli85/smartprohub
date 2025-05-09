"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import DashboardFallback from "./fallback"

export default function ClientDashboardPage() {
  const { user, isLoading } = useAuth()
  const [hasTimedOut, setHasTimedOut] = useState(false)

  // Add a timeout to detect if the dashboard is taking too long to load
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setHasTimedOut(true)
      }
    }, 5000) // 5 seconds timeout

    return () => clearTimeout(timeoutId)
  }, [isLoading])

  // If we've timed out, show the fallback component
  if (hasTimedOut) {
    return <DashboardFallback />
  }

  // If still loading, show a simple loading indicator
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // If no user, redirect to login (this should be handled by the auth provider)
  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Client Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
          <p className="text-gray-500">You have no upcoming appointments.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Recent Messages</h2>
          <p className="text-gray-500">No new messages.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Active Contracts</h2>
          <p className="text-gray-500">You have no active contracts.</p>
        </div>
      </div>
    </div>
  )
}
