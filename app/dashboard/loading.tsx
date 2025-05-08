import { DashboardFallback } from "@/components/dashboard/dashboard-fallback"

export default function DashboardLoading() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <DashboardFallback />
    </div>
  )
}
