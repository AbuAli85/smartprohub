"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ReloadIcon, CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons"
import { SessionTimeoutWarning } from "@/components/auth/session-timeout-warning"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function AuthTestDashboard() {
  const { user, session, profile, isLoading, refreshSession, signOut, isAuthenticated } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [envVariables, setEnvVariables] = useState<Record<string, string | null>>({})
  const [isCheckingEnv, setIsCheckingEnv] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  // Check environment variables
  useEffect(() => {
    const checkEnvVariables = async () => {
      try {
        const response = await fetch("/api/debug/env")
        const data = await response.json()
        setEnvVariables(data)
      } catch (error) {
        console.error("Error checking environment variables:", error)
      } finally {
        setIsCheckingEnv(false)
      }
    }

    checkEnvVariables()
  }, [])

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setLoginError(error.message)
        return
      }

      if (data?.session) {
        toast({
          title: "Login successful",
          description: "You have been successfully logged in.",
        })

        // Force refresh the page to ensure all auth state is updated
        window.location.reload()
      }
    } catch (err) {
      setLoginError("An unexpected error occurred. Please try again.")
      console.error("Login error:", err)
    } finally {
      setLoginLoading(false)
    }
  }

  // Handle session refresh
  const handleRefreshSession = async () => {
    setIsRefreshing(true)
    try {
      // First check if we have a session
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        toast({
          title: "No active session",
          description: "You need to log in first before refreshing a session.",
          variant: "destructive",
        })
        setIsRefreshing(false)
        return
      }

      await refreshSession()
      toast({
        title: "Session refreshed",
        description: "Your session has been refreshed successfully.",
      })
    } catch (error) {
      console.error("Error refreshing session:", error)
      toast({
        title: "Session refresh failed",
        description: "Failed to refresh your session. Please try logging in again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Sign out failed",
        description: "Failed to sign you out. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Format JSON for display
  const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Authentication Test Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Authentication Status
              {isAuthenticated ? (
                <CheckCircledIcon className="ml-2 h-5 w-5 text-green-500" />
              ) : (
                <CrossCircledIcon className="ml-2 h-5 w-5 text-red-500" />
              )}
            </CardTitle>
            <CardDescription>Current authentication state</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading authentication state...</span>
              </div>
            ) : isAuthenticated ? (
              <Alert className="bg-green-50">
                <AlertTitle>Authenticated</AlertTitle>
                <AlertDescription>You are currently signed in.</AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTitle>Not Authenticated</AlertTitle>
                <AlertDescription>You are not currently signed in.</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleRefreshSession} disabled={isRefreshing || !isAuthenticated}>
              {isRefreshing ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                "Refresh Session"
              )}
            </Button>
            {isAuthenticated ? (
              <Button variant="destructive" onClick={handleSignOut}>
                Sign Out
              </Button>
            ) : (
              <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Status of required environment variables</CardDescription>
          </CardHeader>
          <CardContent>
            {isCheckingEnv ? (
              <div className="flex items-center justify-center p-4">
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                <span>Checking environment variables...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(envVariables).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="font-medium">{key}:</span>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {value ? "Set" : "Not Set"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="login">Quick Login</TabsTrigger>
          <TabsTrigger value="session">Session Details</TabsTrigger>
          <TabsTrigger value="user">User Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Login</CardTitle>
              <CardDescription>Sign in to test authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <Alert variant="destructive">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push("/auth/register")}>
                Create Test Account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="session" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>Current session information</CardDescription>
            </CardHeader>
            <CardContent>
              {!session ? (
                <Alert>
                  <AlertTitle>No Active Session</AlertTitle>
                  <AlertDescription>Please log in to see session details.</AlertDescription>
                </Alert>
              ) : (
                <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                  <pre className="text-sm">{formatJSON(session)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Current user and profile information</CardDescription>
            </CardHeader>
            <CardContent>
              {!user ? (
                <Alert>
                  <AlertTitle>No User Data</AlertTitle>
                  <AlertDescription>Please log in to see user and profile details.</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">User</h3>
                    <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
                      <pre className="text-sm">{formatJSON(user)}</pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Profile</h3>
                    <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
                      <pre className="text-sm">{formatJSON(profile)}</pre>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Demo of session timeout warning */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Session Timeout Warning Demo</CardTitle>
            <CardDescription>Preview of the session timeout warning component</CardDescription>
          </CardHeader>
          <CardContent className="relative min-h-[200px] border-2 border-dashed border-gray-200 rounded-md p-4">
            <div className="absolute inset-0 flex items-center justify-center">
              {isAuthenticated ? (
                <SessionTimeoutWarning warningThreshold={60000} />
              ) : (
                <p className="text-gray-500">Sign in to see the session timeout warning</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              The session timeout warning will appear when your session is about to expire.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
