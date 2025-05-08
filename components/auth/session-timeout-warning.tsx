"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ReloadIcon } from "@radix-ui/react-icons"
import { Progress } from "@/components/ui/progress"

interface SessionTimeoutWarningProps {
  warningThreshold?: number // Time in milliseconds before expiry to show warning (default: 5 minutes)
}

export function SessionTimeoutWarning({ warningThreshold = 5 * 60 * 1000 }: SessionTimeoutWarningProps) {
  const { session, refreshSession } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [progress, setProgress] = useState(100)

  // Calculate time until session expiry
  const calculateTimeRemaining = useCallback(() => {
    if (!session || !session.expires_at) return null

    const expiresAt = session.expires_at * 1000 // Convert to milliseconds
    const now = Date.now()
    const remaining = expiresAt - now

    return remaining > 0 ? remaining : 0
  }, [session])

  // Format time remaining as minutes and seconds
  const formatTimeRemaining = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Handle session refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshSession()
    setIsRefreshing(false)
    setShowWarning(false)
  }

  // Check session expiry and update warning state
  useEffect(() => {
    if (!session) {
      setShowWarning(false)
      return
    }

    const checkExpiry = () => {
      const remaining = calculateTimeRemaining()
      setTimeRemaining(remaining)

      if (remaining !== null) {
        // Calculate progress percentage
        const progressValue = remaining <= warningThreshold ? (remaining / warningThreshold) * 100 : 100

        setProgress(progressValue)

        // Show warning if time remaining is less than threshold
        setShowWarning(remaining <= warningThreshold && remaining > 0)
      } else {
        setShowWarning(false)
      }
    }

    // Check immediately
    checkExpiry()

    // Then check every second
    const interval = setInterval(checkExpiry, 1000)

    return () => clearInterval(interval)
  }, [session, warningThreshold, calculateTimeRemaining])

  if (!showWarning || !timeRemaining) {
    return null
  }

  return (
    <Alert variant="warning" className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <AlertTitle className="flex items-center justify-between">
        Session Expiring Soon
        <span className="text-sm font-normal">{formatTimeRemaining(timeRemaining)}</span>
      </AlertTitle>
      <Progress value={progress} className="h-1 mt-2" />
      <AlertDescription className="mt-2">
        <p className="text-sm mb-2">Your session will expire soon. Would you like to stay signed in?</p>
        <Button onClick={handleRefresh} disabled={isRefreshing} size="sm" className="w-full">
          {isRefreshing ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            "Stay Signed In"
          )}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
