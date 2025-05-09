"use client"

import type React from "react"

import { useEffect, useState, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, FileText, MessageSquare, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker"
import { Overview } from "@/components/dashboard/overview"
import { RecentBookings } from "@/components/dashboard/recent-bookings"
import { ClientSignOutButton } from "@/components/auth/client-sign-out-button"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { useAuth } from "@/components/auth/auth-provider"
import { measure } from "@/lib/performance-monitoring"
import Link from "next/link"

// Lazy loaded components
const LazyOverview = () => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadComponent = async () => {
      await measure("loadOverviewComponent", async () => {
        // Simulate network delay for demo purposes
        if (process.env.NODE_ENV === "development") {
          await new Promise((resolve) => setTimeout(resolve, 300))
        }

        if (isMounted) {
          setComponent(() => Overview)
        }
      })
    }

    loadComponent()
    return () => {
      isMounted = false
    }
  }, [])

  if (!Component) {
    return <div className="h-[300px] animate-pulse bg-muted rounded-md" />
  }

  return <Component />
}

const LazyRecentBookings = () => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadComponent = async () => {
      await measure("loadRecentBookingsComponent", async () => {
        // Simulate network delay for demo purposes
        if (process.env.NODE_ENV === "development") {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }

        if (isMounted) {
          setComponent(() => RecentBookings)
        }
      })
    }

    loadComponent()
    return () => {
      isMounted = false
    }
  }, [])

  if (!Component) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-9 w-9 rounded-full animate-pulse bg-muted" />
            <div className="space-y-1 flex-1">
              <div className="h-4 w-3/4 animate-pulse bg-muted rounded" />
              <div className="h-3 w-1/2 animate-pulse bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return <Component />
}

export default function ClientDashboardPage() {
  const { user, isLoading, isInitialized } = useAuth()
  const [isContentLoaded, setIsContentLoaded] = useState(false)

  // Simulate content loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsContentLoaded(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  // Show skeleton while auth is initializing or content is loading
  if (isLoading || !isInitialized || !isContentLoaded) {
    return <DashboardSkeleton />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Client Dashboard</h2>
        <div className="flex items-center gap-2">
          <CalendarDateRangePicker />
          <Button size="sm" variant="outline">
            <Link href="/auth/debug">Debug Auth</Link>
          </Button>
          <ClientSignOutButton />
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="contracts">My Contracts</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">+1 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">+3 since yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$250.00</div>
                <p className="text-xs text-muted-foreground">+$50.00 from last month</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Booking Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Suspense fallback={<div className="h-[300px] animate-pulse bg-muted rounded-md" />}>
                  <LazyOverview />
                </Suspense>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>You have 5 bookings this month.</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-[200px] animate-pulse bg-muted rounded-md" />}>
                  <LazyRecentBookings />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>View and manage your upcoming and past bookings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Your bookings will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>My Contracts</CardTitle>
              <CardDescription>View and manage your active and past contracts.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Your contracts will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
