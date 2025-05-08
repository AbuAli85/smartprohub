import { Suspense } from "react"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { ErrorBoundary } from "@/components/error-boundary"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { DashboardFallback } from "@/components/dashboard/dashboard-fallback"

export default function DashboardPage() {
  return (
    <ErrorBoundary fallback={<DashboardError />}>
      <Suspense fallback={<DashboardFallback />}>
        <div className="space-y-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <DashboardContent />
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
