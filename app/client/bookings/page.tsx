"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, User, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Simple demo data - no external imports needed
const demoBookings = [
  {
    id: "demo-1",
    date: "2023-05-15",
    time: "10:00",
    status: "completed",
    service_name: "Business Consultation",
    provider_name: "Jane Smith",
  },
  {
    id: "demo-2",
    date: "2023-05-20",
    time: "14:30",
    status: "upcoming",
    service_name: "Tax Planning",
    provider_name: "John Davis",
  },
  {
    id: "demo-3",
    date: "2023-05-25",
    time: "11:00",
    status: "upcoming",
    service_name: "Financial Review",
    provider_name: "Sarah Johnson",
  },
  {
    id: "demo-4",
    date: "2023-06-01",
    time: "09:30",
    status: "upcoming",
    service_name: "Legal Consultation",
    provider_name: "Michael Brown",
  },
  {
    id: "demo-5",
    date: "2023-06-10",
    time: "15:00",
    status: "upcoming",
    service_name: "Marketing Strategy",
    provider_name: "Emily Wilson",
  },
]

export default function ClientBookingsPage() {
  // No useEffect or data fetching - just use demo data directly
  const [activeTab, setActiveTab] = useState("all")

  // Simple functions for formatting and display
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
      case "upcoming":
        return <Badge className="bg-green-500">Upcoming</Badge>
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
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Filter bookings based on active tab
  const filteredBookings = demoBookings.filter((booking) => {
    if (activeTab === "all") return true
    if (activeTab === "upcoming") return booking.status === "upcoming"
    if (activeTab === "past") return booking.status === "completed"
    return true
  })

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <Button asChild>
          <Link href="/client/bookings/new">New Booking</Link>
        </Button>
      </div>

      <Alert variant="warning" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Demo Mode Active</AlertTitle>
        <AlertDescription>You're viewing demo booking data due to database permission restrictions.</AlertDescription>
      </Alert>

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
                  <CardTitle className="text-lg font-medium">{booking.service_name}</CardTitle>
                  {getStatusBadge(booking.status)}
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.provider_name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/client/bookings/${booking.id}`}>View Details</Link>
                        </Button>
                        {booking.status === "upcoming" && (
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
