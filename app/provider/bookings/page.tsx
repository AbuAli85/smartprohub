"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, User } from "lucide-react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBookings() {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) return

        const { data, error } = await supabase
          .from("bookings")
          .select(`
            *,
            client:client_id(id, full_name)
          `)
          .eq("provider_id", session.session.user.id)
          .order("booking_date", { ascending: false })

        if (error) {
          throw error
        }

        setBookings(data || [])
      } catch (error: any) {
        console.error("Error fetching bookings:", error)
        toast({
          title: "Error",
          description: "Failed to load bookings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

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
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
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
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <Button asChild>
          <Link href="/provider/availability">Manage Availability</Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="mb-4 text-center text-muted-foreground">You don't have any bookings yet.</p>
                <Button asChild>
                  <Link href="/provider/availability">Set Your Availability</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-muted/50 pb-2">
                  <CardTitle className="text-lg font-medium">{booking.service_name}</CardTitle>
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
                        <span>Client: {booking.client?.full_name || "Unknown Client"}</span>
                      </div>
                      {booking.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between gap-2">
                      {booking.notes && (
                        <div>
                          <p className="text-sm font-medium">Notes:</p>
                          <p className="text-sm text-muted-foreground">{booking.notes}</p>
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/provider/bookings/${booking.id}`}>View Details</Link>
                        </Button>
                        {booking.status === "confirmed" && (
                          <Button variant="outline" size="sm">
                            Mark as Completed
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

        <TabsContent value="upcoming" className="space-y-4">
          {/* Filter for upcoming bookings */}
          {bookings.filter((b) => new Date(b.booking_date) >= new Date() && b.status !== "cancelled").length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="mb-4 text-center text-muted-foreground">You don't have any upcoming bookings.</p>
                <Button asChild>
                  <Link href="/provider/availability">Set Your Availability</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            bookings
              .filter((b) => new Date(b.booking_date) >= new Date() && b.status !== "cancelled")
              .map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between bg-muted/50 pb-2">
                    <CardTitle className="text-lg font-medium">{booking.service_name}</CardTitle>
                    {getStatusBadge(booking.status)}
                  </CardHeader>
                  <CardContent className="pt-4">
                    {/* Same content as above */}
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
                          <span>Client: {booking.client?.full_name || "Unknown Client"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between gap-2">
                        {booking.notes && (
                          <div>
                            <p className="text-sm font-medium">Notes:</p>
                            <p className="text-sm text-muted-foreground">{booking.notes}</p>
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/provider/bookings/${booking.id}`}>View Details</Link>
                          </Button>
                          {booking.status === "confirmed" && (
                            <Button variant="outline" size="sm">
                              Mark as Completed
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

        <TabsContent value="past" className="space-y-4">
          {/* Filter for past bookings */}
          {bookings.filter((b) => new Date(b.booking_date) < new Date() || b.status === "completed").length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-center text-muted-foreground">You don't have any past bookings.</p>
              </CardContent>
            </Card>
          ) : (
            bookings
              .filter((b) => new Date(b.booking_date) < new Date() || b.status === "completed")
              .map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between bg-muted/50 pb-2">
                    <CardTitle className="text-lg font-medium">{booking.service_name}</CardTitle>
                    {getStatusBadge(booking.status)}
                  </CardHeader>
                  <CardContent className="pt-4">
                    {/* Same content as above */}
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
                          <span>Client: {booking.client?.full_name || "Unknown Client"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between gap-2">
                        {booking.notes && (
                          <div>
                            <p className="text-sm font-medium">Notes:</p>
                            <p className="text-sm text-muted-foreground">{booking.notes}</p>
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/provider/bookings/${booking.id}`}>View Details</Link>
                          </Button>
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
