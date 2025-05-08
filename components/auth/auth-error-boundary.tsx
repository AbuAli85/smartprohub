"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useAuth } from "./auth-provider"

interface AuthErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthErrorBoundary({ children, fallback }: AuthErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const { refreshSession } = useAuth()

  useEffect(() => {
    // Set up global error handler for auth errors
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason

      // Only catch auth-related errors
      if (
        error instanceof Error &&
        (error.message.includes("auth") ||
          error.message.includes("session") ||
          error.message.includes("Auth") ||
          error.message.includes("token"))
      ) {
        console.error("Auth Error in AuthErrorBoundary:", error)
        setError(error)
        setHasError(true)

        // Prevent the error from propagating
        event.preventDefault()
      }
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await refreshSession()
      setHasError(false)
      setError(null)
    } catch (e) {
      console.error("Error refreshing session:", e)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleGoToLogin = () => {
    router.push("/auth/login")
  }

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            {error?.message || "There was a problem with your authentication session."}
          </AlertDescription>
        </Alert>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh Session"
            )}
          </Button>

          <Button variant="outline" onClick={handleGoToLogin}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
