"use client"

import { Suspense, useState } from "react"
import AuthTestWrapper from "@/components/auth-test-wrapper"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { ReloadIcon } from "@radix-ui/react-icons"

export default function AuthTestSimplePage() {
  const { isAuthenticated, user, profile, isLoading, refreshSession } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshSession()
    setIsRefreshing(false)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page (Simple)</h1>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <ReloadIcon className="mr-2 h-6 w-6 animate-spin" />
          <span>Loading authentication state...</span>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 border rounded-lg bg-muted/50">
            <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
            <p className="mb-2">
              Status:{" "}
              <span className={isAuthenticated ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </span>
            </p>

            {isAuthenticated && user && (
              <div className="mt-4 space-y-2">
                <p>
                  <span className="font-medium">User ID:</span> {user.id}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                {profile && (
                  <div className="mt-2">
                    <p>
                      <span className="font-medium">Role:</span> {profile.role || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium">Name:</span> {profile.full_name || "Not set"}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
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
            </div>
          </div>

          <Suspense fallback={<div className="p-8 text-center">Loading authentication test component...</div>}>
            <AuthTestWrapper />
          </Suspense>
        </div>
      )}
    </div>
  )
}
