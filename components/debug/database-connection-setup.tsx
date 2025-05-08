"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, Database, RefreshCw } from "lucide-react"

export function DatabaseConnectionSetup() {
  const [databaseUrl, setDatabaseUrl] = useState("")
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [savedUrls, setSavedUrls] = useState<string[]>([])

  const testConnection = async () => {
    if (!databaseUrl) {
      setTestResult({
        success: false,
        message: "Please enter a database URL",
      })
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/test/neon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ databaseUrl }),
      })

      const data = await response.json()

      if (response.ok) {
        setTestResult({
          success: true,
          message: "Connection successful!",
          details: data,
        })

        // Save URL to local storage if it's not already there
        const urls = JSON.parse(localStorage.getItem("databaseUrls") || "[]")
        if (!urls.includes(databaseUrl)) {
          const newUrls = [...urls, databaseUrl]
          localStorage.setItem("databaseUrls", JSON.stringify(newUrls))
          setSavedUrls(newUrls)
        }
      } else {
        setTestResult({
          success: false,
          message: data.message || "Connection failed",
          details: data,
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveToVercel = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/env/set-database-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ databaseUrl }),
      })

      const data = await response.json()

      if (response.ok) {
        setTestResult({
          success: true,
          message:
            "Database URL saved successfully! You may need to redeploy your application for changes to take effect.",
          details: data,
        })
      } else {
        setTestResult({
          success: false,
          message: data.message || "Failed to save database URL",
          details: data,
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load saved URLs from local storage on component mount
  useState(() => {
    const urls = JSON.parse(localStorage.getItem("databaseUrls") || "[]")
    setSavedUrls(urls)
  })

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Connection Setup
        </CardTitle>
        <CardDescription>Configure your Neon PostgreSQL database connection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="connection">
          <TabsList className="mb-4">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>

          <TabsContent value="connection">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="database-url">Database URL</Label>
                <Input
                  id="database-url"
                  placeholder="postgres://username:password@hostname:port/database"
                  value={databaseUrl}
                  onChange={(e) => setDatabaseUrl(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your Neon PostgreSQL connection string. This should start with postgres:// or postgresql://
                </p>
              </div>

              {savedUrls.length > 0 && (
                <div className="space-y-2">
                  <Label>Previously used connections</Label>
                  <div className="space-y-2">
                    {savedUrls.map((url, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <span className="font-mono text-xs truncate max-w-[300px]">
                          {url.replace(/(:.*@)/, ":***@")}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => setDatabaseUrl(url)}>
                          Use
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                <Button onClick={testConnection} disabled={isLoading || !databaseUrl}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={saveToVercel}
                  disabled={isLoading || !databaseUrl || !testResult?.success}
                >
                  Save to Environment
                </Button>
              </div>

              {testResult && (
                <Alert
                  variant={testResult.success ? "default" : "destructive"}
                  className={testResult.success ? "bg-green-50 border-green-200" : undefined}
                >
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{testResult.success ? "Success" : "Error"}</AlertTitle>
                  <AlertDescription>
                    <p>{testResult.message}</p>
                    {testResult.details && (
                      <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(testResult.details, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="help">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">How to get your Neon Database URL</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    Log in to your Neon account at{" "}
                    <a
                      href="https://console.neon.tech"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      console.neon.tech
                    </a>
                  </li>
                  <li>Select your project</li>
                  <li>Go to the "Connection Details" section</li>
                  <li>Select "Prisma" or "Direct Connection" from the dropdown</li>
                  <li>Copy the connection string</li>
                </ol>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Security Note</AlertTitle>
                <AlertDescription>
                  Your database connection string contains sensitive information. Never share it publicly or commit it
                  to version control.
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="font-medium mb-2">Environment Variable Names</h3>
                <p className="text-sm mb-2">The system will look for any of these environment variable names:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>POSTGRES_URL</li>
                  <li>DATABASE_URL</li>
                  <li>NEON_DATABASE_URL</li>
                  <li>NEON_POSTGRES_URL</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          After saving, you may need to redeploy your application for changes to take effect.
        </p>
      </CardFooter>
    </Card>
  )
}
