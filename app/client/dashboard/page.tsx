import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { Calendar, FileText, MessageSquare, DollarSign, User } from "lucide-react"

export default async function ClientDashboardPage() {
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
    redirect("/auth/login?redirectedFrom=/client/dashboard")
  }

  // Get user profile if user exists
  let profile = null
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    if (error) {
      console.error("Error fetching profile:", error)
    }
    profile = data
  } catch (error) {
    console.error("Exception fetching profile:", error)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Client Dashboard</h1>
        <div className="space-x-2">
          <Button asChild variant="outline">
            <Link href="/auth/debug">Debug Auth</Link>
          </Button>
          <SignOutButton />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Your Dashboard</CardTitle>
            <CardDescription>You are logged in as {user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>This is your client dashboard. From here you can manage your bookings and more.</p>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline">
                  <Link href="/client/bookings">My Bookings</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/client/messages">Messages</Link>
                </Button>
              </div>
            </div>
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
                <span>{profile?.role || user.user_metadata?.role || "Client"}</span>
              </div>
              {profile && (
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{profile.full_name || "Not set"}</span>
                </div>
              )}
              <Button asChild variant="outline" size="sm" className="mt-2 w-full">
                <Link href="/client/profile">
                  <User className="mr-2 h-4 w-4" />
                  Update Profile
                </Link>
              </Button>
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
                <Link href="/client/bookings">
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Bookings
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/client/contracts">
                  <FileText className="mr-2 h-4 w-4" />
                  View Contracts
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/client/messages">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/client/billing">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Billing
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Bookings</CardTitle>
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
