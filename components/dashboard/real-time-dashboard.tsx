"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle, Clock, DollarSign, Users, Calendar, FileText, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useSSE } from "@/lib/sse/sse-client"
import { Button } from "@/components/ui/button"

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
  const [isLoading, setIsLoading] = useState(false)
  const [timePeriod, setTimePeriod] = useState("month")
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.error("Error fetching user:", error)
          setError("Authentication error. Using demo data.")
          setIsInitialized(true)
          return
        }

        if (user) {
          setUser(user)

          // Get session for token
          const { data: sessionData } = await supabase.auth.getSession()
          if (sessionData?.session?.access_token) {
            setToken(sessionData.session.access_token)
          }
        } else {
          // No user found, use demo data
          console.log("No authenticated user found, using demo data")
          setIsInitialized(true)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        setError("Failed to fetch user data. Using demo data.")
        setIsInitialized(true)
      }
    }

    fetchUserData()

    // Set a timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      if (!isInitialized) {
        console.log("Initialization timeout reached, using demo data")
        setIsInitialized(true)
        setError("Loading timeout reached. Using demo data.")
      }
    }, 5000) // 5 second timeout

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isInitialized])

  // Fetch dashboard data function
  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setIsInitialized(true)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Set a timeout to prevent hanging on API calls
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 10000))

      // Fetch data from API endpoints with timeout
      const fetchMetrics = fetch(`/api/dashboard/metrics?userId=${user.id}`).then((res) => res.json())
      const fetchRevenue = fetch(`/api/dashboard/revenue?userId=${user.id}&period=${timePeriod}`).then((res) =>
        res.json(),
      )
      const fetchActivity = fetch(`/api/dashboard/activity?userId=${user.id}&limit=10`).then((res) => res.json())

      // Race each fetch against the timeout
      const [metricsData, revenueData, activityData] = await Promise.all([
        Promise.race([fetchMetrics, timeoutPromise]),
        Promise.race([fetchRevenue, timeoutPromise]),
        Promise.race([fetchActivity, timeoutPromise]),
      ])

      // Update state with fetched data
      if (metricsData && !metricsData.error) {
        setMetrics(metricsData[0] || demoData.metrics)
      }

      if (revenueData && !revenueData.error) {
        setRevenueData(revenueData.length ? revenueData : demoData.revenueData)
      }

      if (activityData && !activityData.error) {
        setRecentActivity(activityData.length ? activityData : demoData.recentActivity)
      }

      setIsInitialized(true)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError(`Failed to load dashboard data: ${error.message}. Using demo data.`)

      // Use demo data as fallback
      setMetrics(demoData.metrics)
      setRevenueData(demoData.revenueData)
      setRecentActivity(demoData.recentActivity)
      setIsInitialized(true)
    } finally {
      setIsLoading(false)
    }
  }, [user, timePeriod])

  // Fetch initial dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, timePeriod, fetchDashboardData])

  // Set up SSE connection
  const sseUrl = user && token ? `/api/dashboard/events?userId=${user.id}&token=${token}` : null

  const { isConnected, reconnect } = useSSE(sseUrl, {
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
  })

  // Add event listeners for specific event types
  useEffect(() => {
    if (!user) return

    const handleMetricsUpdate = (event) => {
      try {
        const data = JSON.parse(event.data)
        setMetrics((prev) => ({ ...prev, ...data }))
      } catch (error) {
        console.error("Error parsing metrics update:", error)
      }
    }

    const handleActivityUpdate = (event) => {
      try {
        const data = JSON.parse(event.data)
        setRecentActivity((prev) => [data, ...prev].slice(0, 10))
      } catch (error) {
        console.error("Error parsing activity update:", error)
      }
    }

    const handleRevenueUpdate = (event) => {
      try {
        const data = JSON.parse(event.data)
        setRevenueData(data)
      } catch (error) {
        console.error("Error parsing revenue update:", error)
      }
    }

    // Add event listeners
    if (typeof window !== "undefined" && sseUrl) {
      try {
        const eventSource = new EventSource(sseUrl)

        eventSource.addEventListener("metrics-update", handleMetricsUpdate)
        eventSource.addEventListener("activity-update", handleActivityUpdate)
        eventSource.addEventListener("revenue-update", handleRevenueUpdate)

        // Clean up
        return () => {
          eventSource.removeEventListener("metrics-update", handleMetricsUpdate)
          eventSource.removeEventListener("activity-update", handleActivityUpdate)
          eventSource.removeEventListener("revenue-update", handleRevenueUpdate)
          eventSource.close()
        }
      } catch (error) {
        console.error("Error setting up EventSource:", error)
      }
    }
  }, [user, sseUrl])

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

  // If not initialized yet, show a loading state
  if (!isInitialized) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 p-4 mb-4" role="alert">
          <p className="font-bold">Notice</p>
          <p>{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      )}

      {!isConnected && user && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Connection Status</p>
          <p>Real-time updates are currently disconnected. Data may not be up-to-date.</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={reconnect}>
            <RefreshCw className="h-4 w-4 mr-2" /> Reconnect
          </Button>
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
                            ? activity.title || "Contract"
                            : "New message"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.createdAt || activity.created_at)}
                      </p>
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
