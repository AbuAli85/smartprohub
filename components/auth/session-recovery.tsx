"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, LogIn, RefreshCw } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function SessionRecovery() {
  const { clearLocalSession } = useAuth()
  const [isAttemptingRecovery, setIsAttemptingRecovery] = useState(false)
  const router = useRouter()

  const handleClearSession = () => {
    clearLocalSession()
    router.push("/auth/login")
  }

  const handleAttemptRecovery = () => {
    setIsAttemptingRecovery(true)

    // Clear any problematic auth data
    clearLocalSession()

    // Reload the page to attempt a fresh start
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  useEffect(() => {
    // Set a timeout to stop the recovery spinner if it's been running too long
    if (isAttemptingRecovery) {
      const timeout = setTimeout(() => {
        setIsAttemptingRecovery(false)
      }, 5000)

      return () => clearTimeout(timeout)
    }
  }, [isAttemptingRecovery])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Session Error</CardTitle>
          <CardDescription>There was a problem with your authentication session</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Invalid Refresh Token</AlertTitle>
            <AlertDescription>
              Your session has expired or is invalid. This can happen if you've been inactive for a while or if you've
              signed in on another device.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You can try to recover your session or sign in again to continue using the application.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClearSession} className="flex items-center gap-2">
            <LogIn className="h-4 w-4" /> Sign In Again
          </Button>
          <Button onClick={handleAttemptRecovery} disabled={isAttemptingRecovery} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isAttemptingRecovery ? "animate-spin" : ""}`} />
            {isAttemptingRecovery ? "Recovering..." : "Attempt Recovery"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
