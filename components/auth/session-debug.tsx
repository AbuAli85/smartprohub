"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw, Trash2 } from "lucide-react"
import { Code } from "@/components/ui/code"

export function SessionDebug() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [clearing, setClearing] = useState(false)

  const checkSession = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Session check error:", error)
        setError(error.message)
        setSession(null)
      } else {
        setSession(data.session)
      }
    } catch (err) {
      console.error("Exception checking session:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    setRefreshing(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error("Session refresh error:", error)
        setError(error.message)
      } else {
        setSession(data.session)
        if (data.session) {
          console.log("Session refreshed successfully")
        } else {
          setError("No session returned after refresh")
        }
      }
    } catch (err) {
      console.error("Exception refreshing session:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setRefreshing(false)
    }
  }

  const clearSession = async () => {
    setClearing(true)

    try {
      // Clear local storage
      if (typeof window !== "undefined") {
        const localStorageKeys = Object.keys(localStorage)
        const supabaseKeys = localStorageKeys.filter((key) => key.startsWith("supabase.auth") || key.startsWith("sb-"))

        supabaseKeys.forEach((key) => {
          localStorage.removeItem(key)
        })
      }

      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
      })

      // Sign out from Supabase
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()

      setSession(null)
      console.log("Session cleared successfully")
    } catch (err) {
      console.error("Exception clearing session:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setClearing(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Session Debug</CardTitle>
        <CardDescription>Check your current authentication session status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Session Status</h3>
          <p>{session ? "Authenticated" : "Not Authenticated"}</p>
        </div>

        {session && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Session Details</h3>
            <Code className="text-xs overflow-auto max-h-60">{JSON.stringify(session, null, 2)}</Code>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button onClick={checkSession} disabled={loading} variant="outline" size="sm">
            {loading ? "Checking..." : "Check Session"}
          </Button>

          <Button onClick={refreshSession} disabled={refreshing || !session} variant="outline" size="sm">
            {refreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Session
              </>
            )}
          </Button>

          <Button onClick={clearSession} disabled={clearing} variant="destructive" size="sm">
            {clearing ? (
              <>
                <Trash2 className="mr-2 h-4 w-4 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Session
              </>
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          If you're experiencing authentication issues, try refreshing your session or clearing it and signing in again.
        </p>
      </CardFooter>
    </Card>
  )
}
