"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { syncProfileFromMetadata } from "@/lib/profile-sync"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ReloadIcon, CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons"
import { toast } from "@/components/ui/use-toast"

export function ProfileSync() {
  const { user, profile, refreshSession } = useAuth()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Check if there are discrepancies between user metadata and profile
  const hasDiscrepancies = () => {
    if (!user || !profile) return false

    const metadataName = user.user_metadata?.full_name || user.user_metadata?.name
    const metadataAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture
    const metadataRole = user.user_metadata?.role

    return (
      metadataName !== profile.full_name ||
      metadataAvatar !== profile.avatar_url ||
      (metadataRole && metadataRole !== profile.role)
    )
  }

  const handleSync = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to sync your profile.",
        variant: "destructive",
      })
      return
    }

    setIsSyncing(true)
    setSyncResult(null)

    try {
      const result = await syncProfileFromMetadata()
      setSyncResult(result)

      if (result.success) {
        toast({
          title: "Profile synchronized",
          description: "Your profile has been successfully synchronized with your user metadata.",
        })
        // Refresh session to get updated profile
        await refreshSession()
      } else {
        toast({
          title: "Sync failed",
          description: result.message || "Failed to synchronize your profile.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error syncing profile:", error)
      toast({
        title: "Sync error",
        description: "An unexpected error occurred while syncing your profile.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Format JSON for display
  const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Profile Synchronization
          {hasDiscrepancies() ? (
            <CrossCircledIcon className="ml-2 h-5 w-5 text-amber-500" />
          ) : (
            <CheckCircledIcon className="ml-2 h-5 w-5 text-green-500" />
          )}
        </CardTitle>
        <CardDescription>Synchronize your user metadata with your profile data</CardDescription>
      </CardHeader>
      <CardContent>
        {hasDiscrepancies() ? (
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertTitle>Profile discrepancies detected</AlertTitle>
            <AlertDescription>
              There are differences between your user metadata and profile data. Click the sync button to update your
              profile.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertTitle>Profile is in sync</AlertTitle>
            <AlertDescription>Your profile data matches your user metadata.</AlertDescription>
          </Alert>
        )}

        {syncResult && (
          <Alert className={syncResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
            <AlertTitle>{syncResult.success ? "Sync successful" : "Sync failed"}</AlertTitle>
            <AlertDescription>{syncResult.message}</AlertDescription>
          </Alert>
        )}

        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? "Hide" : "Show"} Details
          </Button>
        </div>

        {showDetails && (
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">User Metadata</h3>
              <div className="bg-gray-100 p-2 rounded-md overflow-auto max-h-40 text-xs">
                <pre>{formatJSON(user?.user_metadata)}</pre>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Profile Data</h3>
              <div className="bg-gray-100 p-2 rounded-md overflow-auto max-h-40 text-xs">
                <pre>{formatJSON(profile)}</pre>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSync} disabled={isSyncing || !user}>
          {isSyncing ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            "Sync Profile"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
