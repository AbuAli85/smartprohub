"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { createBooking, getAvailableTimeSlots } from "@/app/actions/booking-actions"

// Mock data for services
const services = [
  {
    id: "1",
    name: "Business Consultation",
    description: "One-on-one business consultation session",
    duration: 60,
    price: 150,
  },
  {
    id: "2",
    name: "Financial Planning",
    description: "Comprehensive financial planning session",
    duration: 90,
    price: 200,
  },
  {
    id: "3",
    name: "Marketing Strategy",
    description: "Marketing strategy development session",
    duration: 120,
    price: 250,
  },
  {
    id: "4",
    name: "Legal Consultation",
    description: "Legal advice and consultation",
    duration: 60,
    price: 180,
  },
]

export default function NewBookingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [service, setService] = useState<string>("")
  const [time, setTime] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const handleDateChange = async (date: Date | undefined) => {
    setDate(date)
    if (date && service) {
      const formattedDate = format(date, "yyyy-MM-dd")
      const result = await getAvailableTimeSlots(formattedDate, service)
      if (result.success) {
        setTimeSlots(result.timeSlots)
      }
    }
  }

  const handleServiceChange = async (value: string) => {
    setService(value)
    if (date && value) {
      const formattedDate = format(date, "yyyy-MM-dd")
      const result = await getAvailableTimeSlots(formattedDate, value)
      if (result.success) {
        setTimeSlots(result.timeSlots)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !service || !time) return

    setLoading(true)
    const formData = new FormData()
    formData.append("userId", user?.id || "")
    formData.append("serviceId", service)
    formData.append("date", format(date, "yyyy-MM-dd"))
    formData.append("time", time)
    formData.append("notes", notes)

    const result = await createBooking(formData)
    setLoading(false)

    if (result.success) {
      router.push("/dashboard/bookings")
    } else {
      // Handle error
      console.error(result.error)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-6 text-3xl font-bold tracking-tight">New Booking</h2>
      <Card>
        <CardHeader>
          <CardTitle>Book a Service</CardTitle>
          <CardDescription>Fill out the form below to schedule a new booking.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Select value={service} onValueChange={handleServiceChange} required>
                <SelectTrigger id="service">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.price} ({service.duration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Select value={time} onValueChange={setTime} disabled={!date || !service} required>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional information or special requests"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading || !date || !service || !time}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                </>
              ) : (
                "Book Appointment"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
