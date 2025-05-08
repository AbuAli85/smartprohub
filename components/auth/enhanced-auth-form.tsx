"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link"
import type { UserRole } from "@/lib/supabase/database.types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

type AuthFormProps = {
  type?: "login" | "register"
}

// Validation rules
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_MIN_LENGTH = 8

function EnhancedAuthForm({ type = "login" }: AuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard"
  const errorParam = searchParams.get("error")
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<UserRole>("client")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<"login" | "register">(type)

  // Validation states
  const [emailValid, setEmailValid] = useState<boolean | null>(null)
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null)
  const [nameValid, setNameValid] = useState<boolean | null>(null)

  // Supabase client
  const supabase = createClientComponentClient()

  // Validate email in real-time
  useEffect(() => {
    if (email === "") {
      setEmailValid(null)
      return
    }
    setEmailValid(EMAIL_REGEX.test(email))
  }, [email])

  // Validate password in real-time
  useEffect(() => {
    if (password === "") {
      setPasswordValid(null)
      return
    }
    setPasswordValid(password.length >= PASSWORD_MIN_LENGTH)
  }, [password])

  // Validate name in real-time
  useEffect(() => {
    if (fullName === "") {
      setNameValid(null)
      return
    }
    setNameValid(fullName.trim().length >= 2)
  }, [fullName])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Final validation check
      if (!emailValid) {
        throw new Error("Please enter a valid email address")
      }

      // Sign in with email and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error("Authentication successful but no user returned")
      }

      // Show success message
      setMessage({
        type: "success",
        text: "Login successful! Redirecting...",
      })

      toast({
        title: "Login successful",
        description: "Welcome back to SmartPRO!",
        variant: "default",
      })

      // Fetch user profile to determine role
      const { data: profileData } = await supabase.from("profiles").select("role").eq("id", authData.user.id).single()

      // Redirect based on role
      if (profileData?.role === "admin") {
        router.push("/admin/dashboard")
      } else if (profileData?.role === "provider") {
        router.push("/provider/dashboard")
      } else {
        router.push("/client/dashboard")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setMessage({
        type: "error",
        text: error.message || "An error occurred during login",
      })

      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      })

      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Final validation check
      if (!emailValid) {
        throw new Error("Please enter a valid email address")
      }
      if (!passwordValid) {
        throw new Error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
      }
      if (!nameValid) {
        throw new Error("Please enter your full name")
      }

      // Create the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            role: role,
          },
        },
      })

      if (error) {
        throw error
      }

      // Create the profile manually to ensure it exists
      if (data.user) {
        try {
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            role: role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (profileError) {
            console.error("Error creating profile during registration:", profileError)
          }
        } catch (profileError) {
          console.error("Exception creating profile during registration:", profileError)
          // Continue with registration flow even if profile creation fails
        }
      }

      setMessage({
        type: "success",
        text: "Registration successful! Please check your email to confirm your account.",
      })

      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Registration error:", error)
      setMessage({
        type: "error",
        text: error.message || "An error occurred during registration",
      })

      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[100vh] w-full items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Display error from URL parameter if present */}
        {errorParam && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{decodeURIComponent(errorParam)}</AlertDescription>
          </Alert>
        )}

        {/* Display redirectedFrom message if present */}
        {redirectedFrom && redirectedFrom !== "/dashboard" && (
          <Alert className="mb-4">
            <AlertDescription>You need to sign in to access {decodeURIComponent(redirectedFrom)}</AlertDescription>
          </Alert>
        )}

        <Card className="w-full shadow-lg border border-gray-200">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">SmartPRO</CardTitle>
            <CardDescription className="text-center text-base">Business Services Hub</CardDescription>
          </CardHeader>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "login" | "register")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login" className="text-sm font-medium">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="text-sm font-medium">
                Register
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-0">
                  {message && (
                    <Alert variant={message.type === "error" ? "destructive" : "default"}>
                      <AlertDescription>{message.text}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={`h-10 pr-10 ${
                          emailValid === false ? "border-red-500 focus-visible:ring-red-500" : ""
                        } ${emailValid === true ? "border-green-500 focus-visible:ring-green-500" : ""}`}
                      />
                      {emailValid !== null && (
                        <div className="absolute right-3 top-2.5">
                          {emailValid ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {emailValid === false && (
                      <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Link href="/auth/reset-password" className="text-sm text-blue-600 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10"
                    />
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button type="submit" className="w-full h-10" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            <TabsContent value="register" className="mt-0">
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4 pt-0">
                  {message && (
                    <Alert variant={message.type === "error" ? "destructive" : "default"}>
                      <AlertDescription>{message.text}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className={`h-10 pr-10 ${
                          nameValid === false ? "border-red-500 focus-visible:ring-red-500" : ""
                        } ${nameValid === true ? "border-green-500 focus-visible:ring-green-500" : ""}`}
                      />
                      {nameValid !== null && (
                        <div className="absolute right-3 top-2.5">
                          {nameValid ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {nameValid === false && (
                      <p className="text-xs text-red-500 mt-1">Name must be at least 2 characters</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={`h-10 pr-10 ${
                          emailValid === false ? "border-red-500 focus-visible:ring-red-500" : ""
                        } ${emailValid === true ? "border-green-500 focus-visible:ring-green-500" : ""}`}
                      />
                      {emailValid !== null && (
                        <div className="absolute right-3 top-2.5">
                          {emailValid ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {emailValid === false && (
                      <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={PASSWORD_MIN_LENGTH}
                        className={`h-10 pr-10 ${
                          passwordValid === false ? "border-red-500 focus-visible:ring-red-500" : ""
                        } ${passwordValid === true ? "border-green-500 focus-visible:ring-green-500" : ""}`}
                      />
                      {passwordValid !== null && (
                        <div className="absolute right-3 top-2.5">
                          {passwordValid ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {passwordValid === false && (
                      <p className="text-xs text-red-500 mt-1">
                        Password must be at least {PASSWORD_MIN_LENGTH} characters
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label className="text-sm font-medium">I am a:</Label>
                    <RadioGroup value={role} onValueChange={(value) => setRole(value as UserRole)} className="pt-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="client" id="client" />
                        <Label htmlFor="client" className="text-sm font-normal">
                          Client looking for services
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="provider" id="provider" />
                        <Label htmlFor="provider" className="text-sm font-normal">
                          Service Provider
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button type="submit" className="w-full h-10" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

export default EnhancedAuthForm
