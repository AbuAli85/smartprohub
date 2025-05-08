"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ReloadIcon } from "@radix-ui/react-icons"
import { toast } from "@/components/ui/use-toast"

interface SessionTimeoutWarningProps {
  warningThreshold?: number // Time in ms before expiry to show warning
  checkInterval?: number // Time in ms between checks
}

export function SessionTimeoutWarning({
  warningThreshold = 5 * 60 * 1000, // 5 minutes by default
  checkInterval = 60 * 1000, // 1 minute by default
}: SessionTimeoutWarningProps) {
  const { session, refreshSession } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Calculate time remaining in session
  const calculateTimeRemaining = useCallback(() => {
    if (!session || !session.expires_at) return null

    const expiresAt = session.expires_at * 1000 // Convert to milliseconds
    const now = Date.now()
    return Math.max(0, expiresAt - now)
  }, [session])

  // Handle session refresh
  const handleRefreshSession = async () => {
    setIsRefreshing(true)
    try {
      await refreshSession()
      setShowWarning(false)
      toast({
        title: "Session refreshed",
        description: "Your session has been successfully extended.",
      })
    } catch (error) {
      console.error("Error refreshing session:", error)
      toast({
        title: "Session refresh failed",
        description: "Failed to refresh your session. Please try logging in again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Check session expiry
  useEffect(() => {
    if (!session) return

    const checkSessionExpiry = () => {
      const remaining = calculateTimeRemaining()
      setTimeRemaining(remaining)

      if (remaining !== null && remaining < warningThreshold) {
        setShowWarning(true)
      } else {
        setShowWarning(false)
      }
    }

    // Check immediately
    checkSessionExpiry()

    // Set up interval for checking
    const intervalId = setInterval(checkSessionExpiry, checkInterval)

    return () => {
      clearInterval(intervalId)
    }
  }, [session, calculateTimeRemaining, warningThreshold, checkInterval])

  // Format time remaining for display
  const formatTimeRemaining = (ms: number) => {
    if (ms === null) return "Unknown"

    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)

    return `${minutes}m ${seconds}s`
  }

  if (!showWarning || !timeRemaining) return null

  return (
    <Alert className="fixed bottom-4 right-4 w-96 z-50 bg-yellow-50 border-yellow-200 shadow-lg">
      <AlertTitle className="text-yellow-800">Session Expiring Soon</AlertTitle>
      <AlertDescription className="text-yellow-700">
        <p className="mb-2">
          Your session will expire in {formatTimeRemaining(timeRemaining)}. Would you like to extend your session?
        </p>
        <Button
          onClick={handleRefreshSession}
          disabled={isRefreshing}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          {isRefreshing ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            "Extend Session"
          )}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
