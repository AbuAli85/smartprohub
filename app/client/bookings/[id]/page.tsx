"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, User, MapPin, AlertTriangle, ArrowLeft } from "lucide-react"
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
    location: "Virtual Meeting",
    notes: "Discuss business growth strategies and market expansion opportunities.",
    price: 150,
    duration: 60,
  },
  {
    id: "demo-2",
    date: "2023-05-20",
    time: "14:30",
    status: "upcoming",
    service_name: "Tax Planning",
    provider_name: "John Davis",
    location: "Office - Room 302",
    notes: "Bring previous tax returns and financial statements for the past year.",
    price: 200,
    duration: 90,
  },
  {
    id: "demo-3",
    date: "2023-05-25",
    time: "11:00",
    status: "upcoming",
    service_name: "Financial Review",
    provider_name: "Sarah Johnson",
    location: "Virtual Meeting",
    notes: "Quarterly financial review and investment strategy discussion.",
    price: 175,
    duration: 75,
  },
  {
    id: "demo-4",
    date: "2023-06-01",
    time: "09:30",
    status: "upcoming",
    service_name: "Legal Consultation",
    provider_name: "Michael Brown",
    location: "Office - Room 405",
    notes: "Contract review and legal compliance discussion.",
    price: 225,
    duration: 60,
  },
  {
    id: "demo-5",
    date: "2023-06-10",
    time: "15:00",
    status: "upcoming",
    service_name: "Marketing Strategy",
    provider_name: "Emily Wilson",
    location: "Virtual Meeting",
    notes: "Develop marketing plan for Q3 product launch.",
    price: 180,
    duration: 90,
  },
]

export default function BookingDetailsPage({ params }: { params: { id: string } }) {
  const [booking, setBooking] = useState<any>(null)

  useEffect(() => {
    // Find the booking in our demo data
    const foundBooking = demoBookings.find((b) => b.id === params.id)
    setBooking(foundBooking || demoBookings[0]) // Default to first booking if not found
  }, [params.id])

  if (!booking) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-start mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/client/bookings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-center h-40">
          <p>Loading booking details...</p>
        </div>
      </div>
    )
  }

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
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-start mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/client/bookings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Link>
        </Button>
      </div>

      <Alert variant="warning" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Demo Mode Active</AlertTitle>
        <AlertDescription>You're viewing demo booking data due to database permission restrictions.</AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">{booking.service_name}</CardTitle>
              {getStatusBadge(booking.status)}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-medium">Booking Details</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(booking.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {booking.time} ({booking.duration} minutes)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.location}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Provider Information</h3>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.provider_name}</span>
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div className="pt-4">
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-muted-foreground">{booking.notes}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Service Fee</p>
                <p className="text-lg font-bold">${booking.price}</p>
              </div>

              {booking.status === "upcoming" && <Button variant="destructive">Cancel Booking</Button>}
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                Reschedule
              </Button>
              <Button className="w-full" variant="outline">
                Contact Provider
              </Button>
              {booking.status === "completed" && (
                <Button className="w-full" variant="outline">
                  Leave Feedback
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
