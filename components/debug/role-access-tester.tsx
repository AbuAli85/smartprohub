"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Shield, User, Users } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

type RoleType = "admin" | "provider" | "client" | null
type TestResult = "success" | "error" | "pending" | "unauthorized"

interface AccessTest {
  name: string
  description: string
  endpoint: string
  requiredRole: RoleType
  result: TestResult
  message: string
  responseTime?: number
}

export function RoleAccessTester() {
  const [currentRole, setCurrentRole] = useState<RoleType>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [accessTests, setAccessTests] = useState<AccessTest[]>([
    {
      name: "Admin Dashboard",
      description: "Tests access to the admin dashboard",
      endpoint: "/api/debug/access-test/admin",
      requiredRole: "admin",
      result: "pending",
      message: "Not tested yet",
    },
    {
      name: "Provider Dashboard",
      description: "Tests access to the provider dashboard",
      endpoint: "/api/debug/access-test/provider",
      requiredRole: "provider",
      result: "pending",
      message: "Not tested yet",
    },
    {
      name: "Client Dashboard",
      description: "Tests access to the client dashboard",
      endpoint: "/api/debug/access-test/client",
      requiredRole: "client",
      result: "pending",
      message: "Not tested yet",
    },
    {
      name: "Provider Services",
      description: "Tests access to provider services management",
      endpoint: "/api/debug/access-test/provider-services",
      requiredRole: "provider",
      result: "pending",
      message: "Not tested yet",
    },
    {
      name: "Admin User Management",
      description: "Tests access to admin user management",
      endpoint: "/api/debug/access-test/admin-users",
      requiredRole: "admin",
      result: "pending",
      message: "Not tested yet",
    },
  ])

  useEffect(() => {
    async function getUserRole() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setCurrentRole(null)
          setIsLoading(false)
          return
        }

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        setCurrentRole((profile?.role as RoleType) || null)
      } catch (error) {
        console.error("Error fetching user role:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getUserRole()
  }, [])

  const runAccessTests = async () => {
    setIsRunningTests(true)

    const updatedTests = [...accessTests]

    for (let i = 0; i < updatedTests.length; i++) {
      const test = updatedTests[i]
      test.result = "pending"
      test.message = "Testing..."
      setAccessTests([...updatedTests])

      try {
        const startTime = performance.now()
        const response = await fetch(test.endpoint)
        const endTime = performance.now()
        const responseTime = Math.round(endTime - startTime)

        const data = await response.json()

        if (response.ok) {
          test.result = "success"
          test.message = data.message || "Access granted"
        } else {
          test.result = response.status === 403 ? "unauthorized" : "error"
          test.message = data.message || `Error: ${response.status}`
        }

        test.responseTime = responseTime
      } catch (error) {
        test.result = "error"
        test.message = `Request failed: ${error.message}`
      }

      setAccessTests([...updatedTests])

      // Small delay between tests to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    setIsRunningTests(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading user information...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentRole) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          You need to be logged in to run cross-role access tests.
          <div className="mt-4">
            <Button variant="outline" onClick={() => (window.location.href = "/auth/login")}>
              Go to Login
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Role-Based Access Testing</CardTitle>
            <CardDescription>Testing access controls for different user roles</CardDescription>
          </div>
          <Badge variant={currentRole === "admin" ? "default" : currentRole === "provider" ? "outline" : "secondary"}>
            {currentRole === "admin" ? (
              <Shield className="mr-1 h-3 w-3" />
            ) : currentRole === "provider" ? (
              <Users className="mr-1 h-3 w-3" />
            ) : (
              <User className="mr-1 h-3 w-3" />
            )}
            {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Current Role: {currentRole}</AlertTitle>
          <AlertDescription>
            You should have access to {currentRole} resources, but not to resources for other roles.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Tests</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="provider">Provider</TabsTrigger>
            <TabsTrigger value="client">Client</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {accessTests.map((test, index) => (
              <AccessTestCard key={index} test={test} currentRole={currentRole} />
            ))}
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            {accessTests
              .filter((test) => test.requiredRole === "admin")
              .map((test, index) => (
                <AccessTestCard key={index} test={test} currentRole={currentRole} />
              ))}
          </TabsContent>

          <TabsContent value="provider" className="space-y-4">
            {accessTests
              .filter((test) => test.requiredRole === "provider")
              .map((test, index) => (
                <AccessTestCard key={index} test={test} currentRole={currentRole} />
              ))}
          </TabsContent>

          <TabsContent value="client" className="space-y-4">
            {accessTests
              .filter((test) => test.requiredRole === "client")
              .map((test, index) => (
                <AccessTestCard key={index} test={test} currentRole={currentRole} />
              ))}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {isRunningTests ? (
            <Badge variant="outline" className="animate-pulse">
              <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
              Running Tests...
            </Badge>
          ) : (
            <Badge variant="outline">
              {accessTests.filter((t) => t.result === "success").length} of {accessTests.length} tests passed
            </Badge>
          )}
        </div>
        <Button onClick={runAccessTests} disabled={isRunningTests}>
          {isRunningTests ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>Run Access Tests</>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

function AccessTestCard({ test, currentRole }: { test: AccessTest; currentRole: RoleType }) {
  const getExpectedResult = () => {
    if (currentRole === test.requiredRole) {
      return "Should have access"
    } else {
      return "Should be denied access"
    }
  }

  const getResultIcon = () => {
    switch (test.result) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "unauthorized":
        return <Shield className="h-5 w-5 text-amber-500" />
      default:
        return <RefreshCw className="h-5 w-5 text-gray-400" />
    }
  }

  const getResultBadge = () => {
    switch (test.result) {
      case "success":
        return <Badge variant="success">Access Granted</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "unauthorized":
        return <Badge variant="warning">Access Denied</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const isCorrectBehavior = () => {
    if (test.result === "pending") return null

    const shouldHaveAccess = currentRole === test.requiredRole
    const hasAccess = test.result === "success"

    return shouldHaveAccess === hasAccess
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{test.name}</CardTitle>
          {getResultBadge()}
        </div>
        <CardDescription>{test.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Required Role</p>
            <p className="font-medium">{test.requiredRole}</p>
          </div>
          <div>
            <p className="text-gray-500">Expected Result</p>
            <p className="font-medium">{getExpectedResult()}</p>
          </div>
          <div>
            <p className="text-gray-500">Endpoint</p>
            <p className="font-medium text-xs">{test.endpoint}</p>
          </div>
          <div>
            <p className="text-gray-500">Response Time</p>
            <p className="font-medium">{test.responseTime ? `${test.responseTime}ms` : "N/A"}</p>
          </div>
        </div>

        {test.result !== "pending" && (
          <div className="mt-4 flex items-center gap-2">
            {getResultIcon()}
            <p className="text-sm">{test.message}</p>
          </div>
        )}

        {isCorrectBehavior() !== null && (
          <div className="mt-4">
            {isCorrectBehavior() ? (
              <Alert variant="success" className="bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Correct Behavior</AlertTitle>
                <AlertDescription>Access control is working as expected for your role.</AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Incorrect Behavior</AlertTitle>
                <AlertDescription>Access control is not working as expected for your role.</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
