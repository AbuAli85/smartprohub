"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle, Clock, DollarSign, Users, Calendar, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useSSE } from "@/lib/sse/sse-client"

// Demo data for initial render
const demoData = {
  metrics: {
    totalBookings: 24,
    confirmedBookings: 18,
    pendingBookings: 4,
    cancelledBookings: 2,
    totalContracts: 12,
    signedContracts: 8,
    totalContractValue: 24500,
  },
  revenueData: [
    { date: "2023-01", revenue: 4200 },
    { date: "2023-02", revenue: 3800 },
    { date: "2023-03", revenue: 5100 },
    { date: "2023-04", revenue: 4800 },
    { date: "2023-05", revenue: 5600 },
    { date: "2023-06", revenue: 6200 },
  ],
  recentActivity: [
    { id: "1", type: "booking", status: "confirmed", createdAt: "2023-06-01T10:30:00Z" },
    {
      id: "2",
      type: "contract",
      status: "signed",
      createdAt: "2023-05-28T14:20:00Z",
      title: "Marketing Services Agreement",
    },
    { id: "3", type: "message", status: "unread", createdAt: "2023-05-27T09:15:00Z" },
  ],
}

export function RealTimeDashboard() {
  const [metrics, setMetrics] = useState(demoData.metrics)
  const [revenueData, setRevenueData] = useState(demoData.revenueData)
  const [recentActivity, setRecentActivity] = useState(demoData.recentActivity)
  const [isLoading, setIsLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState("month")
  const [user, setUser] = useState<any>(null)

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Error fetching user:", error)
      }
    }

    fetchUserData()
  }, [])

  // Fetch initial dashboard data
  useEffect(() => {
    if (!user) return

    async function fetchDashboardData() {
      try {
        setIsLoading(true)

        // Fetch data from API endpoints
        const [metricsRes, revenueRes, activityRes] = await Promise.all([
          fetch(`/api/dashboard/metrics?userId=${user.id}`),
          fetch(`/api/dashboard/revenue?userId=${user.id}&period=${timePeriod}`),
          fetch(`/api/dashboard/activity?userId=${user.id}&limit=10`),
        ])

        if (metricsRes.ok && revenueRes.ok && activityRes.ok) {
          const [metricsData, revenueData, activityData] = await Promise.all([
            metricsRes.json(),
            revenueRes.json(),
            activityRes.json(),
          ])

          setMetrics(metricsData)
          setRevenueData(revenueData)
          setRecentActivity(activityData)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()

    // Set up real-time subscription
    // const subscription = setupRealtimeSubscription(user.id)

    // return () => {
    //   // Clean up subscription
    //   if (subscription) {
    //     subscription.unsubscribe()
    //   }
    // }
  }, [user, timePeriod])

  const { isConnected, disconnect } = useSSE(
    `/api/dashboard/events?userId=${user?.id}&token=${localStorage.getItem("supabase.auth.token")}`,
    {
      onOpen: () => {
        console.log("SSE connection established")
      },
      onMessage: (event) => {
        // Handle generic messages
        console.log("SSE message received:", event)
      },
      onError: (error) => {
        console.error("SSE connection error:", error)
      },
      onReconnect: () => {
        console.log("Attempting to reconnect SSE")
      },
      maxRetries: 5,
      retryInterval: 3000,
    },
  )

  // Add event listeners for specific event types
  useEffect(() => {
    if (!user) return

    const handleMetricsUpdate = (event) => {
      const data = JSON.parse(event.data)
      setMetrics((prev) => ({ ...prev, ...data }))
    }

    const handleActivityUpdate = (event) => {
      const data = JSON.parse(event.data)
      setRecentActivity((prev) => [data, ...prev].slice(0, 10))
    }

    const handleRevenueUpdate = (event) => {
      const data = JSON.parse(event.data)
      setRevenueData(data)
    }

    // Add event listeners
    window.addEventListener("metrics-update", handleMetricsUpdate)
    window.addEventListener("activity-update", handleActivityUpdate)
    window.addEventListener("revenue-update", handleRevenueUpdate)

    // Clean up
    return () => {
      window.removeEventListener("metrics-update", handleMetricsUpdate)
      window.removeEventListener("activity-update", handleActivityUpdate)
      window.removeEventListener("revenue-update", handleRevenueUpdate)
      disconnect()
    }
  }, [user, disconnect])

  // Set up real-time subscription
  function setupRealtimeSubscription(userId: string) {
    if (!userId) return null

    // This is a simplified example - in a real app, you would use WebSockets or SSE
    // to subscribe to Redis pub/sub channels
    const eventSource = new EventSource(`/api/dashboard/events?userId=${userId}`)

    eventSource.addEventListener("metrics-update", (event) => {
      const data = JSON.parse(event.data)
      setMetrics((prev) => ({ ...prev, ...data }))
    })

    eventSource.addEventListener("activity-update", (event) => {
      const data = JSON.parse(event.data)
      setRecentActivity((prev) => [data, ...prev].slice(0, 10))
    })

    eventSource.addEventListener("revenue-update", (event) => {
      const data = JSON.parse(event.data)
      setRevenueData(data)
    })

    return {
      unsubscribe: () => {
        eventSource.close()
      },
    }
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Get activity icon
  const getActivityIcon = (type: string, status: string) => {
    if (type === "booking") {
      return status === "confirmed" ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : status === "pending" ? (
        <Clock className="h-4 w-4 text-yellow-500" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-500" />
      )
    } else if (type === "contract") {
      return <FileText className="h-4 w-4 text-blue-500" />
    } else {
      return <AlertCircle className="h-4 w-4 text-purple-500" />
    }
  }

  return (
    <div className="space-y-6">
      {!isConnected && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Connection Status</p>
          <p>Reconnecting to real-time updates...</p>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{metrics.totalBookings}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signed Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{metrics.signedContracts}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contract Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalContractValue)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{metrics.pendingBookings}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>
              <Tabs defaultValue="month" className="w-[400px]" onValueChange={setTimePeriod}>
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `$${value}`} width={80} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-revenue)"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest bookings, contracts, and messages</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity: any) => (
                  <div key={activity.id} className="flex items-center">
                    <div className="mr-2">{getActivityIcon(activity.type, activity.status)}</div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.type === "booking"
                          ? "New booking"
                          : activity.type === "contract"
                            ? activity.title
                            : "New message"}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(activity.createdAt)}</p>
                    </div>
                    <Badge
                      variant={
                        activity.status === "confirmed" || activity.status === "signed"
                          ? "default"
                          : activity.status === "pending"
                            ? "outline"
                            : activity.status === "unread"
                              ? "secondary"
                              : "destructive"
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
