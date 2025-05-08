"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"

export default function AuthDebugPage() {
  const searchParams = useSearchParams()
  const from = searchParams.get("from")
  const error = searchParams.get("error")

  const [sessionData, setSessionData] = useState<any>(null)
  const [envData, setEnvData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      try {
        // Get session data
        const { data: sessionData } = await supabase.auth.getSession()
        setSessionData(sessionData)

        // Get environment variables status
        const envResponse = await fetch("/api/debug/env")
        const envData = await envResponse.json()
        setEnvData(envData)
      } catch (error) {
        console.error("Error fetching debug data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase.auth])

  const refreshData = () => {
    setLoading(true)
    window.location.reload()
  }

  const goBack = () => {
    window.history.back()
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Authentication Debug</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {from && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Redirect Information</AlertTitle>
          <AlertDescription>
            You were redirected from: <code className="bg-muted px-1 py-0.5 rounded">{from}</code>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
            <CardDescription>Current authentication session information</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Status of required environment variables</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">{JSON.stringify(envData, null, 2)}</pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browser Information</CardTitle>
            <CardDescription>Details about your current browser environment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">User Agent:</span> {navigator.userAgent}
              </div>
              <div>
                <span className="font-medium">Current URL:</span> {window.location.href}
              </div>
              <div>
                <span className="font-medium">Cookies Enabled:</span> {navigator.cookieEnabled ? "Yes" : "No"}
              </div>
              <div>
                <span className="font-medium">Local Storage Available:</span>{" "}
                {typeof window !== "undefined" && window.localStorage ? "Yes" : "No"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Steps</CardTitle>
            <CardDescription>Common solutions for authentication issues</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Verify that all environment variables are correctly set in Vercel</li>
              <li>Check that CORS settings in Supabase include your domain</li>
              <li>Clear browser cookies and local storage</li>
              <li>Try using a different browser</li>
              <li>Check Vercel deployment logs for errors</li>
              <li>Ensure your Supabase project is on the correct plan and not paused</li>
              <li>Verify that the redirect URLs in Supabase match your application URLs</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
