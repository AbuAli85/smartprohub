import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, FileText, MessageSquare, Calendar } from "lucide-react"

export default async function DashboardPage() {
  // Use cookies correctly by awaiting it
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Get the user - more secure than getSession
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login?redirectedFrom=/dashboard")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Determine user role
  const userRole = profile?.role || user.user_metadata?.role || "client"

  // If debug mode is not enabled, redirect to role-specific dashboard
  const url = new URL(headers().get("x-url") || "http://localhost")
  const isDebugMode = url.searchParams.has("debug")

  if (!isDebugMode && userRole && userRole !== "unknown") {
    switch (userRole) {
      case "admin":
        redirect("/admin/dashboard")
      case "provider":
        redirect("/provider/dashboard")
      case "client":
        redirect("/client/dashboard")
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="space-x-2">
          <Button asChild variant="outline">
            <Link href="/auth/debug">Debug Auth</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/api/auth/signout">Sign Out</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user.email}</CardTitle>
            <CardDescription>
              {userRole ? `You are logged in as a ${userRole}` : "You don't have a role assigned yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userRole ? (
              <div className="space-y-4">
                <p>
                  You have been assigned the role of <strong>{userRole}</strong>. You can access your role-specific
                  dashboard using the button below.
                </p>
                <Button asChild>
                  <Link href={`/${userRole}/dashboard`}>Go to {userRole} Dashboard</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-yellow-700 bg-yellow-50 p-4 rounded-md">
                  You don't have a role assigned yet. Please complete your profile setup to get started.
                </p>
                <Button asChild>
                  <Link href="/profile-setup">Complete Profile Setup</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Role:</span>
                <span>{userRole || "Not set"}</span>
              </div>
              {profile && (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{profile.full_name || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Phone:</span>
                    <span>{profile.phone || "Not set"}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/bookings">
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Bookings
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/contracts">
                  <FileText className="mr-2 h-4 w-4" />
                  View Contracts
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/messages">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/profile">
                  <Users className="mr-2 h-4 w-4" />
                  Update Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No bookings yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No active contracts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No unread messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">No transactions yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper function to get headers in a server component
function headers() {
  const headersList = new Headers()
  try {
    // @ts-ignore - This is a hack to get the current URL in a server component
    headersList.set("x-url", window.location.href)
  } catch (e) {
    // Ignore errors in server environment
  }
  return headersList
}
