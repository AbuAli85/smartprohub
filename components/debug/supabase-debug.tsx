"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import { ReloadIcon, CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons"

export function SupabaseDebug() {
  const { user, session, refreshSession } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "error" | "checking">("checking")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [envVariables, setEnvVariables] = useState<{ name: string; status: "ok" | "missing" | "invalid" }[]>([])

  // Check Supabase connection
  const checkConnection = async () => {
    setIsLoading(true)
    setConnectionStatus("checking")
    setErrorMessage(null)

    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        setConnectionStatus("error")
        setErrorMessage("Supabase environment variables are not configured properly.")
        checkEnvironmentVariables()
        setIsLoading(false)
        return
      }

      // Try to make a simple query to check connection
      const { error } = await supabase.from("profiles").select("id").limit(1)

      if (error) {
        console.error("Supabase connection error:", error)
        setConnectionStatus("error")
        setErrorMessage(error.message || "Could not connect to Supabase")
      } else {
        setConnectionStatus("connected")
      }
    } catch (error) {
      console.error("Error checking Supabase connection:", error)
      setConnectionStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      checkEnvironmentVariables()
      setIsLoading(false)
    }
  }

  // Check environment variables
  const checkEnvironmentVariables = () => {
    const variables = [
      {
        name: "NEXT_PUBLIC_SUPABASE_URL",
        value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      },
      {
        name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    ]

    setEnvVariables(
      variables.map((v) => ({
        name: v.name,
        status: !v.value ? "missing" : v.value.length < 10 ? "invalid" : "ok",
      })),
    )
  }

  // Handle refresh session
  const handleRefreshSession = async () => {
    setIsRefreshing(true)
    try {
      await refreshSession()
      await checkConnection()
    } catch (error) {
      console.error("Error refreshing session:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Initial check on component mount
  useEffect(() => {
    checkConnection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Status</CardTitle>
          <CardDescription>Check your Supabase connection and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Connection Status:</span>
              <span className="flex items-center">
                {connectionStatus === "checking" && (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                )}
                {connectionStatus === "connected" && (
                  <>
                    <CheckCircledIcon className="mr-2 h-4 w-4 text-green-500" />
                    Connected
                  </>
                )}
                {connectionStatus === "error" && (
                  <>
                    <CrossCircledIcon className="mr-2 h-4 w-4 text-red-500" />
                    Error
                  </>
                )}
              </span>
            </div>

            {errorMessage && (
              <Alert variant="destructive">
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="pt-2">
              <h3 className="font-medium mb-2">Environment Variables:</h3>
              <ul className="space-y-2">
                {envVariables.map((v) => (
                  <li key={v.name} className="flex items-center justify-between">
                    <span>{v.name}</span>
                    <span className="flex items-center">
                      {v.status === "ok" && (
                        <>
                          <CheckCircledIcon className="mr-2 h-4 w-4 text-green-500" />
                          OK
                        </>
                      )}
                      {v.status === "missing" && (
                        <>
                          <CrossCircledIcon className="mr-2 h-4 w-4 text-red-500" />
                          Missing
                        </>
                      )}
                      {v.status === "invalid" && (
                        <>
                          <CrossCircledIcon className="mr-2 h-4 w-4 text-yellow-500" />
                          Invalid
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <h3 className="font-medium mb-2">Authentication Status:</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>User:</span>
                  <span>{user ? user.email : "Not logged in"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Session:</span>
                  <span>{session ? "Active" : "None"}</span>
                </div>
                {session && (
                  <div className="flex items-center justify-between">
                    <span>Expires:</span>
                    <span>{new Date(session.expires_at! * 1000).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={checkConnection} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Connection"
                )}
              </Button>
              <Button onClick={handleRefreshSession} disabled={isRefreshing} variant="outline">
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
        </CardContent>
      </Card>
    </div>
  )
}
