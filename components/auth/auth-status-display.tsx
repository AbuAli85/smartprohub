"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ReloadIcon, ExitIcon } from "@radix-ui/react-icons"
import { useState } from "react"

export function AuthStatusDisplay() {
  const { user, profile, isAuthenticated, isLoading, refreshSession, signOut } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshSession()
    setIsRefreshing(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>Loading authentication information...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <ReloadIcon className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Status</CardTitle>
        <CardDescription>{isAuthenticated ? "You are currently signed in" : "You are not signed in"}</CardDescription>
      </CardHeader>
      <CardContent>
        {isAuthenticated && user ? (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1">
              <span className="font-medium text-muted-foreground">User ID:</span>
              <span className="col-span-2 break-all">{user.id}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="font-medium text-muted-foreground">Email:</span>
              <span className="col-span-2">{user.email}</span>
            </div>
            {profile && (
              <>
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-medium text-muted-foreground">Role:</span>
                  <span className="col-span-2 capitalize">{profile.role || "Not set"}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-medium text-muted-foreground">Name:</span>
                  <span className="col-span-2">{profile.full_name || "Not set"}</span>
                </div>
              </>
            )}
            <div className="grid grid-cols-3 gap-1">
              <span className="font-medium text-muted-foreground">Session:</span>
              <span className="col-span-2 text-green-600">Active</span>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            No active session. Please sign in to access your account.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing || !isAuthenticated}>
          {isRefreshing ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            "Refresh Session"
          )}
        </Button>
        {isAuthenticated && (
          <Button variant="destructive" onClick={signOut}>
            <ExitIcon className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
