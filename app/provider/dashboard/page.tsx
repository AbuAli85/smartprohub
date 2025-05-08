"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Users, FileText, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker"
import { Overview } from "@/components/dashboard/overview"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { supabase } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export default function ProviderDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    revenueChange: 0,
    totalClients: 0,
    clientsChange: 0,
    activeContracts: 0,
    contractsChange: 0,
    newMessages: 0,
    messagesChange: 0,
  })
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) return

        const providerId = session.session.user.id

        // Fetch stats
        const [
          { data: revenueData },
          { data: clientsData },
          { data: contractsData },
          { data: messagesData },
          { data: bookingsData },
        ] = await Promise.all([
          // Revenue data
          supabase
            .from("bookings")
            .select("service_fee")
            .eq("provider_id", providerId)
            .eq("status", "completed"),

          // Clients data
          supabase
            .from("provider_clients")
            .select("client_id")
            .eq("provider_id", providerId),

          // Contracts data
          supabase
            .from("contracts")
            .select("id, status")
            .eq("provider_id", providerId)
            .in("status", ["signed", "active"]),

          // Messages data
          supabase
            .from("messages")
            .select("id, created_at")
            .eq("recipient_id", providerId)
            .eq("read", false),

          // Upcoming bookings
          supabase
            .from("bookings")
            .select(`
              id, 
              booking_date, 
              start_time, 
              end_time, 
              status, 
              service_name,
              client:client_id(id, full_name, avatar_url)
            `)
            .eq("provider_id", providerId)
            .gte("booking_date", new Date().toISOString().split("T")[0])
            .order("booking_date", { ascending: true })
            .order("start_time", { ascending: true })
            .limit(5),
        ])

        // Calculate total revenue
        const totalRevenue = revenueData?.reduce((sum, booking) => sum + (booking.service_fee || 0), 0) || 0

        // Set stats
        setStats({
          totalRevenue,
          revenueChange: 15.3, // For demo, we'll hardcode this
          totalClients: clientsData?.length || 0,
          clientsChange: 12.5, // For demo, we'll hardcode this
          activeContracts: contractsData?.length || 0,
          contractsChange: 5, // For demo, we'll hardcode this
          newMessages: messagesData?.length || 0,
          messagesChange: messagesData?.length || 0, // Just use the count
        })

        // Set upcoming bookings
        setUpcomingBookings(bookingsData || [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Provider Dashboard</h2>
        <div className="flex items-center gap-2">
          <CalendarDateRangePicker />
          <Button size="sm" variant="outline">
            <Link href="/auth/debug">Debug Auth</Link>
          </Button>
          <SignOutButton />
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">My Clients</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.revenueChange >= 0 ? "+" : ""}
                      {stats.revenueChange}% from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-[60px]" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">+{stats.totalClients}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.clientsChange >= 0 ? "+" : ""}
                      {stats.clientsChange}% from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-[60px]" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">+{stats.activeContracts}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.contractsChange >= 0 ? "+" : ""}
                      {stats.contractsChange}% from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-[60px]" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">+{stats.newMessages}</div>
                    <p className="text-xs text-muted-foreground">+{stats.messagesChange} since last hour</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>
                  You have {upcomingBookings.length} booking{upcomingBookings.length !== 1 ? "s" : ""} this week.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[160px]" />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : upcomingBookings.length === 0 ? (
                  <div className="flex h-[200px] items-center justify-center">
                    <p className="text-center text-muted-foreground">No upcoming bookings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={booking.client?.avatar_url || ""} alt={booking.client?.full_name || ""} />
                          <AvatarFallback>{booking.client?.full_name?.[0] || "C"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{booking.client?.full_name}</p>
                            <div
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : booking.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {booking.status}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{booking.service_name}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span>{formatDate(booking.booking_date)}</span>
                            <span>
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="clients">
          <div className="flex h-[200px] items-center justify-center">
            <Link href="/provider/clients">
              <Button>View All Clients</Button>
            </Link>
          </div>
        </TabsContent>
        <TabsContent value="bookings">
          <div className="flex h-[200px] items-center justify-center">
            <Link href="/provider/bookings">
              <Button>View All Bookings</Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
