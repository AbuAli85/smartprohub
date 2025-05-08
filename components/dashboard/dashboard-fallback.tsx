"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface DashboardFallbackProps {
  error?: string
  title?: string
  description?: string
}

export function DashboardFallback({
  error = "We're having trouble loading your dashboard data.",
  title = "Dashboard Unavailable",
  description = "We're experiencing some technical difficulties. Please try again later.",
}: DashboardFallbackProps) {
  const router = useRouter()

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Dashboard</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Troubleshooting Steps:</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Check your internet connection</li>
              <li>Verify that you're logged in correctly</li>
              <li>Run a system health check to identify issues</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={() => router.refresh()} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Dashboard
            </Button>

            <Button variant="outline" asChild>
              <Link href="/debug/system">Run System Check</Link>
            </Button>

            <Button variant="secondary" asChild>
              <Link href="/auth/debug">Check Authentication</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
