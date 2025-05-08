"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface AuthStatusCheckProps {
  showLoginButton?: boolean
  showRefreshButton?: boolean
  redirectToLogin?: boolean
  redirectPath?: string
  className?: string
}

export function AuthStatusCheck({
  showLoginButton = true,
  showRefreshButton = true,
  redirectToLogin = false,
  redirectPath = "/auth/login",
  className = "",
}: AuthStatusCheckProps) {
  const { isAuthenticated, isLoading, refreshSession } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  // Handle refresh session
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshSession()
    setIsRefreshing(false)
  }

  // Redirect to login if needed
  if (redirectToLogin && !isLoading && !isAuthenticated) {
    router.push(redirectPath)
    return null
  }

  // If authenticated, don't show anything
  if (isAuthenticated) {
    return null
  }

  // If still loading, show nothing
  if (isLoading) {
    return null
  }

  // If not authenticated, show warning
  return (
    <Alert variant="warning" className={className}>
      <AlertDescription className="flex items-center justify-between">
        <span>You are not currently signed in.</span>
        <div className="flex gap-2">
          {showRefreshButton && (
            <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <ReloadIcon className="mr-2 h-3 w-3 animate-spin" />
                  Refreshing...
                </>
              ) : (
                "Refresh"
              )}
            </Button>
          )}
          {showLoginButton && (
            <Button size="sm" onClick={() => router.push(redirectPath)}>
              Sign In
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
