"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Database, User, Shield } from "lucide-react"
import { DatabaseFallbackNotice } from "@/components/debug/database-fallback-notice"

interface SystemStatus {
  database: {
    neon: { status: string; message: string }
    supabase: { status: string; message: string }
  }
  auth: {
    status: string
    user: string | null
    role: string | null
    message: string
  }
  environment: {
    variables: Record<string, string>
  }
  timestamp: string
}

export function SystemCheck() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSystemStatus = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/system-check")

      if (!response.ok) {
        throw new Error(`Error fetching system status: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setStatus(data)
    } catch (err) {
      console.error("Error fetching system status:", err)
      setError(err.message || "An error occurred while checking system status")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemStatus()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Checking system status...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error checking system status</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!status) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No data available</AlertTitle>
        <AlertDescription>Could not retrieve system status information</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Health Check</CardTitle>
            <CardDescription>
              Verify that all components of your SmartPRO Business Services Hub are working correctly
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchSystemStatus}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Run Check
          </Button>
        </div>
      </CardHeader>
      {status?.database?.neon?.status === "error" && status.database.neon.message.includes("No database URL") && (
        <div className="px-6">
          <DatabaseFallbackNotice />
        </div>
      )}
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <div className="grid gap-4 md:grid-cols-3">
              <StatusCard
                title="Database Status"
                items={[
                  {
                    name: "Neon:",
                    status: status.database.neon.status === "connected" ? "success" : "error",
                    message: status.database.neon.status,
                  },
                  {
                    name: "Supabase:",
                    status: status.database.supabase.status === "connected" ? "success" : "error",
                    message: status.database.supabase.status,
                  },
                ]}
                icon={<Database className="h-5 w-5" />}
              />

              <StatusCard
                title="Authentication"
                items={[
                  {
                    name: "Status:",
                    status: status.auth.status === "authenticated" ? "success" : "error",
                    message: status.auth.status,
                  },
                  {
                    name: "Role:",
                    status: status.auth.role ? "success" : "warning",
                    message: status.auth.role || "unknown",
                  },
                ]}
                icon={<User className="h-5 w-5" />}
              />

              <StatusCard
                title="Environment"
                items={[
                  {
                    name: "Postgres URL:",
                    status: status.environment.variables.postgres_url === "configured" ? "success" : "error",
                    message: status.environment.variables.postgres_url,
                  },
                  {
                    name: "Supabase Config:",
                    status:
                      status.environment.variables.supabase_url === "configured" &&
                      status.environment.variables.supabase_anon_key === "configured"
                        ? "success"
                        : "error",
                    message:
                      status.environment.variables.supabase_url === "configured" &&
                      status.environment.variables.supabase_anon_key === "configured"
                        ? "configured"
                        : "missing",
                  },
                ]}
                icon={<Shield className="h-5 w-5" />}
              />
            </div>

            {status.auth.status === "authenticated" &&
            status.database.neon.status === "connected" &&
            status.database.supabase.status === "connected" ? (
              <Alert className="mt-4 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>All systems operational</AlertTitle>
                <AlertDescription>
                  You are logged in as {status.auth.user} with role: {status.auth.role}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>System issues detected</AlertTitle>
                <AlertDescription>
                  One or more components are not functioning correctly. Check the details in the tabs above.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="database">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Neon PostgreSQL</h3>
                <p className="text-sm text-gray-500 mb-4">Direct database connection status</p>

                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={status.database.neon.status === "connected" ? "success" : "error"} />
                  <span className="font-medium">Status: {status.database.neon.status}</span>
                </div>

                <p className="text-sm text-gray-600">{status.database.neon.message}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Supabase</h3>
                <p className="text-sm text-gray-500 mb-4">Supabase database connection status</p>

                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={status.database.supabase.status === "connected" ? "success" : "error"} />
                  <span className="font-medium">Status: {status.database.supabase.status}</span>
                </div>

                <p className="text-sm text-gray-600">{status.database.supabase.message}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="authentication">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Authentication Status</h3>
                <p className="text-sm text-gray-500 mb-4">Current user authentication information</p>

                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={status.auth.status === "authenticated" ? "success" : "error"} />
                  <span className="font-medium">Status: {status.auth.status}</span>
                </div>

                <p className="text-sm text-gray-600">{status.auth.message}</p>
              </div>

              {status.auth.status === "authenticated" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">User Email</h4>
                    <p className="font-medium">{status.auth.user}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">User Role</h4>
                    <p className="font-medium">{status.auth.role}</p>
                  </div>
                </div>
              )}

              {status.auth.status !== "authenticated" && (
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Not authenticated</AlertTitle>
                  <AlertDescription>
                    You are not currently logged in. Some features may not be available.
                    <div className="mt-4">
                      <Button variant="outline" onClick={() => (window.location.href = "/auth/login")}>
                        Go to Login
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="environment">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Environment Variables</h3>
                <p className="text-sm text-gray-500 mb-4">Status of required environment variables</p>

                <Alert variant="default" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Security Note</AlertTitle>
                  <AlertDescription>
                    For security reasons, the actual values of environment variables are not displayed. Only their
                    configuration status is shown.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  {Object.entries(status.environment.variables).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b">
                      <span className="font-medium uppercase">{key}</span>
                      <StatusBadge status={value === "configured" ? "success" : "error"} label={value} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Last checked: {new Date(status.timestamp).toLocaleString()}
      </CardFooter>
    </Card>
  )
}

function StatusCard({
  title,
  items,
  icon,
}: {
  title: string
  items: { name: string; status: "success" | "error" | "warning"; message: string }[]
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm">{item.name}</span>
              <StatusBadge status={item.status} label={item.message} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({
  status,
  label,
}: {
  status: "success" | "error" | "warning"
  label?: string
}) {
  const getStatusConfig = () => {
    switch (status) {
      case "success":
        return {
          variant: "success" as const,
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          text: label || "Success",
        }
      case "error":
        return {
          variant: "destructive" as const,
          icon: <XCircle className="h-3 w-3 mr-1" />,
          text: label || "Error",
        }
      case "warning":
        return {
          variant: "warning" as const,
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          text: label || "Warning",
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Badge variant={config.variant}>
      {config.icon}
      {config.text}
    </Badge>
  )
}
