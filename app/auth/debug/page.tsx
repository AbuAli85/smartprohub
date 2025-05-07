import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthDebuggerWrapper } from "@/components/auth/auth-debugger-wrapper"

export default async function AuthDebugPage() {
  // Use cookies correctly by awaiting it
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get user profile if session exists
  let profile = null
  if (session) {
    const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
    profile = data
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Auth Debugger</h1>
        <div className="space-x-2">
          <Button asChild variant="outline">
            <Link href="/">Home</Link>
          </Button>
          {session ? (
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/auth/login">Login</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current authentication state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`p-4 rounded-md ${session ? "bg-green-50" : "bg-yellow-50"}`}>
                <p className={session ? "text-green-700" : "text-yellow-700"}>
                  {session ? "You are authenticated" : "You are not authenticated"}
                </p>
              </div>

              {session && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{session.user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">User ID:</span>
                    <span>{session.user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Role (metadata):</span>
                    <span>{session.user.user_metadata?.role || "Not set"}</span>
                  </div>
                  {profile && (
                    <div className="flex justify-between">
                      <span className="font-medium">Role (profile):</span>
                      <span>{profile.role || "Not set"}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Actions</CardTitle>
            <CardDescription>Tools to help diagnose authentication issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button asChild variant="outline">
                <Link href="/dashboard?debug=true">Access Dashboard (Debug Mode)</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/client/dashboard?debug=true">Access Client Dashboard (Debug Mode)</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/login?debug=true">Access Login (Debug Mode)</Link>
              </Button>
              <AuthDebuggerWrapper />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
            <CardDescription>Raw session and profile data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Session Data:</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm max-h-[200px]">
                  {JSON.stringify(session, null, 2) || "No session data"}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2">Profile Data:</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm max-h-[200px]">
                  {JSON.stringify(profile, null, 2) || "No profile data"}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
