"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw } from "lucide-react"

export default function EnvironmentDebugPage() {
  const [envVars, setEnvVars] = useState<{ [key: string]: string | undefined }>({})
  const [isLoading, setIsLoading] = useState(true)

  const checkEnvironmentVariables = () => {
    setIsLoading(true)

    // Check for environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey
        ? `${supabaseKey.substring(0, 3)}...${supabaseKey.substring(supabaseKey.length - 3)}`
        : undefined,
    })

    setIsLoading(false)
  }

  useEffect(() => {
    checkEnvironmentVariables()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables Debug</CardTitle>
          <CardDescription>Check if your environment variables are properly configured</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Environment Status</h3>
              <Button variant="outline" size="sm" onClick={checkEnvironmentVariables} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-medium">{key}</p>
                  <p className="text-sm text-muted-foreground">{value ? value : "Not set"}</p>
                </div>
                {value ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            ))}

            {(!envVars.NEXT_PUBLIC_SUPABASE_URL || !envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Missing Environment Variables</AlertTitle>
                <AlertDescription>
                  <p>Some required environment variables are missing. Please add them to your Vercel project.</p>
                  <ul className="list-disc list-inside mt-2">
                    {!envVars.NEXT_PUBLIC_SUPABASE_URL && <li>NEXT_PUBLIC_SUPABASE_URL is missing</li>}
                    {!envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY && <li>NEXT_PUBLIC_SUPABASE_ANON_KEY is missing</li>}
                  </ul>
                  <div className="mt-2">
                    <p>After adding these variables, you need to redeploy your application.</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {envVars.NEXT_PUBLIC_SUPABASE_URL && envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Environment Variables Configured</AlertTitle>
                <AlertDescription>
                  Your Supabase environment variables appear to be properly configured. If you're still experiencing
                  issues, try the following:
                  <ul className="list-disc list-inside mt-2">
                    <li>Redeploy your application</li>
                    <li>Clear your browser cache</li>
                    <li>Check for any console errors</li>
                    <li>Verify your Supabase project is active</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
