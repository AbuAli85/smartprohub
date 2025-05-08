"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export function AuthDebugger() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function getSession() {
      try {
        setLoading(true)
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        setSession(session)

        if (session?.user?.id) {
          // Get profile data
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (profileError && profileError.code !== "PGRST116") {
            console.error("Profile fetch error:", profileError)
          }

          setProfile(profileData || null)
        }
      } catch (error) {
        console.error("Session fetch error:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    getSession()
  }, [supabase])

  if (loading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Status</CardTitle>
        <CardDescription>{session ? "You are currently authenticated" : "You are not authenticated"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="session">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="session">Session</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="cookies">Cookies</TabsTrigger>
          </TabsList>

          <TabsContent value="session" className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <pre className="text-xs overflow-auto max-h-[300px]">
                {session ? JSON.stringify(session, null, 2) : "No active session"}
              </pre>
            </div>

            {session && (
              <Button
                variant="destructive"
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.reload()
                }}
              >
                Sign Out
              </Button>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <pre className="text-xs overflow-auto max-h-[300px]">
                {profile ? JSON.stringify(profile, null, 2) : "No profile data found"}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="cookies" className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <pre className="text-xs overflow-auto max-h-[300px]">
                {document.cookie
                  .split(";")
                  .map((cookie) => cookie.trim())
                  .join("\n")}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">Error: {error}</div>}
      </CardContent>
    </Card>
  )
}
