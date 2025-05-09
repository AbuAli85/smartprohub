"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, RefreshCw, Home } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardFallback() {
  const [countdown, setCountdown] = useState(15)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Force reload the page after countdown
          window.location.reload()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    router.push("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Dashboard Loading Issue</CardTitle>
          <CardDescription>
            We're having trouble loading your dashboard. This could be due to a temporary connection issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <AlertDescription>Automatic refresh in {countdown} seconds...</AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground">
            <p>If this issue persists:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Check your internet connection</li>
              <li>Try clearing your browser cache</li>
              <li>Sign out and sign back in</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleGoHome}>
            <Home className="h-4 w-4 mr-2" />
            Go to Home
          </Button>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
