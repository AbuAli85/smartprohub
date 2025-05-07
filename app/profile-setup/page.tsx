"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function ProfileSetupPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<"client" | "provider" | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        router.push("/auth/login")
        return
      }

      setUser(data.session.user)

      // Check if profile already exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.session.user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching profile:", profileError)
      }

      // If profile exists and has a role, redirect to appropriate dashboard
      if (profile && profile.role) {
        let redirectPath = "/dashboard"

        switch (profile.role) {
          case "admin":
            redirectPath = "/admin/dashboard"
            break
          case "provider":
            redirectPath = "/provider/dashboard"
            break
          case "client":
            redirectPath = "/client/dashboard"
            break
        }

        router.push(redirectPath)
        return
      }

      setLoading(false)
    }

    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!role) {
      toast({
        title: "Please select a role",
        description: "You must select either Client or Service Provider to continue.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // Create or update profile
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        role: role,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Profile setup complete",
        description: "Your profile has been set up successfully.",
      })

      // Redirect based on role
      const redirectPath = role === "provider" ? "/provider/dashboard" : "/client/dashboard"
      router.push(redirectPath)
    } catch (error: any) {
      toast({
        title: "Error setting up profile",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto flex h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Please provide your information to complete your profile setup.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>I am a:</Label>
              <RadioGroup value={role || ""} onValueChange={(value) => setRole(value as "client" | "provider")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client">Client</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="provider" id="provider" />
                  <Label htmlFor="provider">Service Provider</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
