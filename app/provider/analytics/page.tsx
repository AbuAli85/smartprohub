"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker"
import { Loader2, TrendingUp, Users, Calendar, DollarSign } from "lucide-react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { toast } from "@/components/ui/use-toast"

export default function ProviderAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [clientsData, setClientsData] = useState<any[]>([])
  const [bookingsData, setBookingsData] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalClients: 0,
    totalBookings: 0,
    completionRate: 0,
  })

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) return

        const providerId = session.session.user.id

        // Get current year
        const currentYear = new Date().getFullYear()

        // Create array of months
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        // Initialize data with all months and zero values
        const initialRevenueData = months.map((name, index) => ({
          name,
          revenue: 0,
          month: index + 1,
        }))

        const initialClientsData = months.map((name, index) => ({
          name,
          clients: 0,
          month: index + 1,
        }))

        const initialBookingsData = months.map((name, index) => ({
          name,
          bookings: 0,
          month: index + 1,
        }))

        // Fetch completed bookings for the current year
        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select("service_fee, booking_date, status, client_id")
          .eq("provider_id", providerId)
          .gte("booking_date", `${currentYear}-01-01`)
          .lte("booking_date", `${currentYear}-12-31`)

        if (bookingsError) throw bookingsError

        // Fetch client data
        const { data: clients, error: clientsError } = await supabase
          .from("provider_clients")
          .select("client_id, created_at")
          .eq("provider_id", providerId)

        if (clientsError) throw clientsError

        // Process bookings data
        let totalRevenue = 0
        let totalCompletedBookings = 0
        const uniqueClientIds = new Set()

        if (bookings && bookings.length > 0) {
          // Track unique clients from bookings
          bookings.forEach((booking) => {
            if (booking.client_id) {
              uniqueClientIds.add(booking.client_id)
            }

            if (booking.booking_date) {
              const bookingDate = new Date(booking.booking_date)
              const monthIndex = bookingDate.getMonth()

              // Increment bookings count for the month
              initialBookingsData[monthIndex].bookings += 1

              // If completed, add to revenue
              if (booking.status === "completed" && booking.service_fee) {
                initialRevenueData[monthIndex].revenue += booking.service_fee
                totalRevenue += booking.service_fee
                totalCompletedBookings += 1
              }
            }
          })
        }

        // Process clients data
        if (clients && clients.length > 0) {
          clients.forEach((client) => {
            if (client.created_at) {
              const createdDate = new Date(client.created_at)
              // Only count if created this year
              if (createdDate.getFullYear() === currentYear) {
                const monthIndex = createdDate.getMonth()
                initialClientsData[monthIndex].clients += 1
              }
            }
          })
        }

        // Set the data
        setRevenueData(initialRevenueData)
        setClientsData(initialClientsData)
        setBookingsData(initialBookingsData)

        // Calculate stats
        setStats({
          totalRevenue,
          totalClients: uniqueClientIds.size,
          totalBookings: bookings?.length || 0,
          completionRate: bookings?.length ? (totalCompletedBookings / bookings.length) * 100 : 0,
        })
      } catch (error: any) {
        console.error("Error fetching analytics data:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <CalendarDateRangePicker />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">For the current year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Unique clients served</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">For the current year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Bookings completed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Your monthly revenue for the current year</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`$${value}`, "Revenue"]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>New Clients</CardTitle>
              <CardDescription>New clients acquired each month</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clientsData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value: any) => [value, "New Clients"]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Line type="monotone" dataKey="clients" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Activity</CardTitle>
              <CardDescription>Number of bookings per month</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingsData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value: any) => [value, "Bookings"]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="bookings" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
