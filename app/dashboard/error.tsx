"use client"

import { useEffect } from "react"
import { DashboardFallback } from "@/components/dashboard/dashboard-fallback"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error)
  }, [error])

  return <DashboardFallback error={error} />
}
