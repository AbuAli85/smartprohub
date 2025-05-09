"use client"

import { useState, useEffect } from "react"
import { getSessionTimeRemaining, refreshSession } from "@/lib/session-manager"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function SessionTimeoutWarning() {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    // Check session time remaining every minute
    const checkSessionTime = () => {
      const remaining = getSessionTimeRemaining()
      setTimeRemaining(remaining)

      // Show warning if less than 5 minutes remaining
      if (remaining !== null && remaining < 300000) {
        setShowWarning(true)
      } else {
        setShowWarning(false)
      }
    }

    // Initial check
    checkSessionTime()

    // Set up interval
    const intervalId = setInterval(checkSessionTime, 60000)

    return () => clearInterval(intervalId)
  }, [])

  const handleRefresh = async () => {
    await refreshSession()
    setShowWarning(false)
    // Check time remaining again
    const remaining = getSessionTimeRemaining()
    setTimeRemaining(remaining)
  }

  if (!showWarning) return null

  return (
    <Alert variant="warning" className="fixed bottom-4 right-4 w-auto max-w-md z-50 shadow-lg">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Session Expiring Soon</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>Your session will expire in {timeRemaining ? Math.ceil(timeRemaining / 60000) : "a few"} minutes.</p>
        <Button size="sm" onClick={handleRefresh}>
          Refresh Session
        </Button>
      </AlertDescription>
    </Alert>
  )
}
