"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"

export default function AuthTestPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error" | "info" | null; text: string }>({
    type: null,
    text: "",
  })
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [envVars, setEnvVars] = useState<any>(null)
  const [envLoading, setEnvLoading] = useState(true)

  const supabase = createClientComponentClient()

  // Check current session on load
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
    }

    checkSession()
  }, [supabase.auth])

  // Check environment variables
  useEffect(() => {
    async function checkEnvVars() {
      try {
        setEnvLoading(true)
        const res = await fetch("/api/debug/env")
        const data = await res.json()
        setEnvVars(data)
      } catch (error) {
        console.error("Failed to fetch environment variables:", error)
        setEnvVars({ error: "Failed to fetch environment variables" })
      } finally {
        setEnvLoading(false)
      }
    }

    checkEnvVars()
  }, [])

  // Handle sign up
  async function handleSignUp() {
    setLoading(true)
    setMessage({ type: null, text: "" })

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setMessage({
        type: "success",
        text: `Success! Verification email sent to ${email}. Check your inbox.`,
      })
    } catch (error: any) {
      setMessage({ type: "error", text: `Error: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  // Handle sign in with email
  async function handleSignIn() {
    setLoading(true)
    setMessage({ type: null, text: "" })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setSession(data.session)
      setMessage({ type: "success", text: "Signed in successfully!" })
    } catch (error: any) {
      setMessage({ type: "error", text: `Error: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  // Handle sign in with OTP
  async function handlePhoneSignIn() {
    setLoading(true)
    setMessage({ type: null, text: "" })

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
      })

      if (error) throw error

      setMessage({
        type: "info",
        text: `OTP sent to ${phone}. Please enter the code below.`,
      })
    } catch (error: any) {
      setMessage({ type: "error", text: `Error: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP
  async function handleVerifyOtp() {
    setLoading(true)
    setMessage({ type: null, text: "" })

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      })

      if (error) throw error

      setSession(data.session)
      setMessage({ type: "success", text: "Phone number verified successfully!" })
    } catch (error: any) {
      setMessage({ type: "error", text: `Error: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  // Handle password reset request
  async function handlePasswordReset() {
    setLoading(true)
    setMessage({ type: null, text: "" })

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setMessage({
        type: "success",
        text: `Password reset email sent to ${email}. Check your inbox.`,
      })
    } catch (error: any) {
      setMessage({ type: "error", text: `Error: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  // Handle sign out
  async function handleSignOut() {
    setLoading(true)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      setSession(null)
      setMessage({ type: "info", text: "Signed out successfully" })
    } catch (error: any) {
      setMessage({ type: "error", text: `Error: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Authentication Test Page</h1>

      {/* Environment Variables Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Environment Variables Status
          </CardTitle>
          <CardDescription>Checking if required environment variables are properly configured</CardDescription>
        </CardHeader>
        <CardContent>
          {envLoading ? (
            <p>Loading environment variables status...</p>
          ) : envVars ? (
            <div className="grid gap-2">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  {value === "Set" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">{key}:</span> {value}
                </div>
              ))}
            </div>
          ) : (
            <p>Failed to load environment variables status</p>
          )}
        </CardContent>
      </Card>

      {/* Session Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Current Session Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {session ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Authenticated as:</span> {session.user.email || session.user.phone}
              </div>
              <div>
                <span className="font-medium">User ID:</span> {session.user.id}
              </div>
              <div>
                <span className="font-medium">Session Expires:</span>{" "}
                {new Date(session.expires_at * 1000).toLocaleString()}
              </div>
              <Button onClick={handleSignOut} variant="destructive" disabled={loading}>
                {loading ? "Signing Out..." : "Sign Out"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span>Not authenticated. Please sign in.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auth Methods */}
      {!session && (
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email">Email/Password</TabsTrigger>
            <TabsTrigger value="phone">Phone (OTP)</TabsTrigger>
            <TabsTrigger value="reset">Password Reset</TabsTrigger>
          </TabsList>

          {/* Email/Password Tab */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email and Password Authentication</CardTitle>
                <CardDescription>Sign up or sign in with your email and password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button onClick={handleSignUp} disabled={loading || !email || !password}>
                  {loading ? "Processing..." : "Sign Up"}
                </Button>
                <Button onClick={handleSignIn} disabled={loading || !email || !password}>
                  {loading ? "Processing..." : "Sign In"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Phone OTP Tab */}
          <TabsContent value="phone">
            <Card>
              <CardHeader>
                <CardTitle>Phone Authentication (OTP)</CardTitle>
                <CardDescription>Sign in with your phone number using a one-time password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                {message.type === "info" && (
                  <div className="space-y-2">
                    <label htmlFor="otp" className="text-sm font-medium">
                      One-Time Password
                    </label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {message.type === "info" ? (
                  <Button onClick={handleVerifyOtp} disabled={loading || !otp}>
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                ) : (
                  <Button onClick={handlePhoneSignIn} disabled={loading || !phone}>
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Password Reset Tab */}
          <TabsContent value="reset">
            <Card>
              <CardHeader>
                <CardTitle>Password Reset</CardTitle>
                <CardDescription>Request a password reset link to be sent to your email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="reset-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handlePasswordReset} disabled={loading || !email}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Status Messages */}
      {message.type && (
        <Alert className="mt-8" variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "success" && <CheckCircle className="h-4 w-4" />}
          {message.type === "error" && <XCircle className="h-4 w-4" />}
          {message.type === "info" && <AlertCircle className="h-4 w-4" />}
          <AlertTitle>
            {message.type === "success" && "Success"}
            {message.type === "error" && "Error"}
            {message.type === "info" && "Information"}
          </AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Debug Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Browser:</span> {navigator.userAgent}
            </div>
            <div>
              <span className="font-medium">Current URL:</span> {window.location.href}
            </div>
            <div>
              <span className="font-medium">Origin:</span> {window.location.origin}
            </div>
            <div>
              <span className="font-medium">Supabase URL:</span>{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_URL || "Not available"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
