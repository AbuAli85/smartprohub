"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, User, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

// Demo data as fallback
const demoBookings = [
  {
    id: "demo-1",
    booking_date: "2023-05-15",
    start_time: "10:00",
    end_time: "11:00",
    status: "completed",
    service: { name: "Business Consultation" },
    provider: { full_name: "Jane Smith" },
  },
  {
    id: "demo-2",
    booking_date: "2023-05-20",
    start_time: "14:30",
    end_time: "15:30",
    status: "confirmed",
    service: { name: "Tax Planning" },
    provider: { full_name: "John Davis" },
  },
  {
    id: "demo-3",
    booking_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    start_time: "11:00",
    end_time: "12:00",
    status: "confirmed",
    service: { name: "Financial Review" },
    provider: { full_name: "Sarah Johnson" },
  },
]

export default function ClientBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [useDemoData, setUseDemoData] = useState(false)

  useEffect(() => {
    async function fetchUserAndBookings() {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          throw new Error("Authentication error: " + sessionError.message)
        }

        if (!sessionData?.session?.user) {
          console.log("No active session, using demo data")
          setUseDemoData(true)
          setBookings(demoBookings)
          setLoading(false)
          return
        }

        const currentUserId = sessionData.session.user.id
        console.log("Current user ID:", currentUserId)

        // Try to fetch bookings directly instead of checking if table exists first
        try {
          const { data: bookingsData, error: bookingsError } = await supabase
            .from("bookings")
            .select(`
          id, booking_date, start_time, end_time, status, notes,
          provider:provider_id (id, full_name, email),
          service:service_id (id, name, description, price, duration)
        `)
            .eq("client_id", currentUserId)
            .order("booking_date", { ascending: false })

          if (bookingsError) {
            // If there's an error, check if it's because the table doesn't exist
            if (bookingsError.message.includes("does not exist") || bookingsError.code === "42P01") {
              console.log("Bookings table doesn't exist, using demo data")
              setUseDemoData(true)
              setBookings(demoBookings)
              setError("Using demo data: Bookings table doesn't exist. Please set up your database first.")
              return
            }

            console.error("Error with joined query:", bookingsError)
            throw bookingsError
          }

          console.log("Bookings data with joins:", bookingsData)
          setBookings(bookingsData || [])

          if (bookingsData?.length === 0) {
            console.log("No bookings found")
            setError("No bookings found. You can create a new booking.")
          }
        } catch (joinErr) {
          console.error("Join query failed, trying simple query:", joinErr)

          // If the join query fails, try a simpler query
          try {
            const { data: simpleData, error: simpleError } = await supabase
              .from("bookings")
              .select("*")
              .eq("client_id", currentUserId)
              .order("booking_date", { ascending: false })

            if (simpleError) {
              if (simpleError.message.includes("does not exist") || simpleError.code === "42P01") {
                console.log("Bookings table doesn't exist, using demo data")
                setUseDemoData(true)
                setBookings(demoBookings)
                setError("Using demo data: Bookings table doesn't exist. Please set up your database first.")
                return
              }

              console.error("Simple query error:", simpleError)
              throw simpleError
            }

            console.log("Simple bookings data:", simpleData)
            setBookings(simpleData || [])

            if (simpleData?.length === 0) {
              console.log("No bookings found")
              setError("No bookings found. You can create a new booking or check database relationships.")
            }
          } catch (simpleErr) {
            console.error("Both queries failed:", simpleErr)
            setUseDemoData(true)
            setBookings(demoBookings)
            setError("Using demo data due to database errors. Please check your database setup.")
          }
        }
      } catch (err: any) {
        console.error("Error in fetchUserAndBookings:", err)
        setUseDemoData(true)
        setBookings(demoBookings)
        setError("Using demo data: " + (err.message || "Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndBookings()
  }, [])

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "all") return true

    const bookingDate = new Date(booking.booking_date)
    const today = new Date()

    if (activeTab === "upcoming") {
      return bookingDate >= today && booking.status !== "cancelled"
    }

    if (activeTab === "past") {
      return bookingDate < today || booking.status === "completed"
    }

    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e) {
      return dateString || "Invalid date"
    }
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return "N/A"
    return timeString.substring(0, 5)
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading bookings...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <Button asChild>
          <Link href="/client/bookings/new">New Booking</Link>
        </Button>
      </div>

      {error && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>
            {error}
            {error.includes("database") && (
              <div className="mt-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href="/setup/database">Setup Database</Link>
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {useDemoData && (
        <Alert className="mb-4 bg-blue-50">
          <AlertTitle>Demo Mode</AlertTitle>
          <AlertDescription>
            You're viewing demo booking data. To see your actual bookings, please ensure your database is properly set
            up.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="mb-4 text-center text-muted-foreground">No bookings found in this category.</p>
                <Button asChild>
                  <Link href="/client/bookings/new">Book a Service</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-muted/50 pb-2">
                  <CardTitle className="text-lg font-medium">
                    {booking.service?.name || booking.service_name || "Service"}
                  </CardTitle>
                  {getStatusBadge(booking.status)}
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(booking.booking_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Provider: {booking.provider?.full_name || booking.provider_name || "Provider"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/client/bookings/${booking.id}`}>View Details</Link>
                        </Button>
                        {(booking.status === "confirmed" || booking.status === "upcoming") && (
                          <Button variant="destructive" size="sm">
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
