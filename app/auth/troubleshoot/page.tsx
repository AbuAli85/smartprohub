"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSupabaseClient } from "@/lib/supabase/client"
import Link from "next/link"
import { AlertCircle, CheckCircle, RefreshCw, Trash2 } from "lucide-react"

export default function TroubleshootPage() {
  const [checking, setChecking] = useState(true)
  const [sessionStatus, setSessionStatus] = useState<"present" | "missing" | "error">("missing")
  const [sessionDetails, setSessionDetails] = useState<any>(null)
  const [clearingStorage, setClearingStorage] = useState(false)
  const [refreshingSession, setRefreshingSession] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    setChecking(true)
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Session check error:", error)
        setSessionStatus("error")
        setMessage(error.message)
      } else if (data.session) {
        setSessionStatus("present")
        setSessionDetails({
          userId: data.session.user.id,
          email: data.session.user.email,
          expiresAt: new Date(data.session.expires_at! * 1000).toLocaleString(),
        })
      } else {
        setSessionStatus("missing")
      }
    } catch (err) {
      console.error("Exception checking session:", err)
      setSessionStatus("error")
      setMessage(err instanceof Error ? err.message : "Unknown error checking session")
    } finally {
      setChecking(false)
    }
  }

  const clearLocalStorage = () => {
    setClearingStorage(true)
    try {
      // Clear all Supabase-related items from localStorage
      const localStorageKeys = Object.keys(localStorage)
      const supabaseKeys = localStorageKeys.filter((key) => key.startsWith("supabase.auth") || key.startsWith("sb-"))

      supabaseKeys.forEach((key) => {
        localStorage.removeItem(key)
      })

      // Clear cookies related to auth
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
      })

      setMessage("Local storage and cookies cleared. You will need to sign in again.")
      setSessionStatus("missing")
      setSessionDetails(null)
    } catch (err) {
      console.error("Error clearing storage:", err)
      setMessage("Error clearing local storage: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setClearingStorage(false)
    }
  }

  const refreshSession = async () => {
    setRefreshingSession(true)
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error("Session refresh error:", error)
        setMessage("Failed to refresh session: " + error.message)
      } else if (data.session) {
        setSessionStatus("present")
        setSessionDetails({
          userId: data.session.user.id,
          email: data.session.user.email,
          expiresAt: new Date(data.session.expires_at! * 1000).toLocaleString(),
        })
        setMessage("Session refreshed successfully!")
      } else {
        setSessionStatus("missing")
        setMessage("No session found after refresh. Please sign in again.")
      }
    } catch (err) {
      console.error("Exception refreshing session:", err)
      setMessage("Error refreshing session: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setRefreshingSession(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Authentication Troubleshooter</h1>

      {message && (
        <Alert className="mb-6" variant={message.includes("success") ? "default" : "destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Status</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Session Status</CardTitle>
          <CardDescription>Check if you have an active authentication session</CardDescription>
        </CardHeader>
        <CardContent>
          {checking ? (
            <div className="flex items-center">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Checking session status...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center">
                {sessionStatus === "present" ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className="font-medium">
                  {sessionStatus === "present"
                    ? "Active session found"
                    : sessionStatus === "missing"
                      ? "No active session found"
                      : "Error checking session"}
                </span>
              </div>

              {sessionStatus === "present" && sessionDetails && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Session Details</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">User ID:</span> {sessionDetails.userId}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {sessionDetails.email}
                    </p>
                    <p>
                      <span className="font-medium">Expires:</span> {sessionDetails.expiresAt}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button onClick={checkSession} disabled={checking}>
            <RefreshCw className={`mr-2 h-4 w-4 ${checking ? "animate-spin" : ""}`} />
            Check Session
          </Button>

          <Button
            variant="outline"
            onClick={refreshSession}
            disabled={refreshingSession || sessionStatus !== "present"}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshingSession ? "animate-spin" : ""}`} />
            Refresh Session
          </Button>

          <Button variant="destructive" onClick={clearLocalStorage} disabled={clearingStorage}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Local Session
          </Button>
        </CardFooter>
      </Card>

      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/auth/login">Sign In</Link>
        </Button>

        <Button asChild variant="outline">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
