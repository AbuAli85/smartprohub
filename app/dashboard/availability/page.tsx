"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Loader2, Plus, Save, Trash } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Days of the week
const daysOfWeek = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
]

// Mock time slots
const defaultTimeSlots = [
  { id: "1", day: "monday", startTime: "09:00", endTime: "17:00", isAvailable: true },
  { id: "2", day: "tuesday", startTime: "09:00", endTime: "17:00", isAvailable: true },
  { id: "3", day: "wednesday", startTime: "09:00", endTime: "17:00", isAvailable: true },
  { id: "4", day: "thursday", startTime: "09:00", endTime: "17:00", isAvailable: true },
  { id: "5", day: "friday", startTime: "09:00", endTime: "17:00", isAvailable: true },
  { id: "6", day: "saturday", startTime: "10:00", endTime: "14:00", isAvailable: false },
  { id: "7", day: "sunday", startTime: "10:00", endTime: "14:00", isAvailable: false },
]

// Mock specific dates
const defaultSpecificDates = [
  { id: "1", date: new Date(2023, 11, 25), isAvailable: false, reason: "Christmas Day" },
  { id: "2", date: new Date(2024, 0, 1), isAvailable: false, reason: "New Year's Day" },
  { id: "3", date: new Date(2023, 10, 23), isAvailable: false, reason: "Thanksgiving" },
]

export default function AvailabilityPage() {
  const [timeSlots, setTimeSlots] = useState(defaultTimeSlots)
  const [specificDates, setSpecificDates] = useState(defaultSpecificDates)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [dateAvailable, setDateAvailable] = useState(true)
  const [dateReason, setDateReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleTimeSlotChange = (id: string, field: string, value: any) => {
    setTimeSlots(timeSlots.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot)))
  }

  const handleAddSpecificDate = () => {
    if (!selectedDate) return

    // Check if date already exists
    const exists = specificDates.some((d) => d.date.toDateString() === selectedDate.toDateString())

    if (exists) {
      toast({
        title: "Date already exists",
        description: "This date is already in your list.",
        variant: "destructive",
      })
      return
    }

    setSpecificDates([
      ...specificDates,
      {
        id: Date.now().toString(),
        date: selectedDate,
        isAvailable: dateAvailable,
        reason: dateReason,
      },
    ])

    setSelectedDate(undefined)
    setDateReason("")
    setDateAvailable(true)
  }

  const handleRemoveSpecificDate = (id: string) => {
    setSpecificDates(specificDates.filter((date) => date.id !== id))
  }

  const handleSaveAvailability = async () => {
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Availability updated",
      description: "Your availability settings have been saved successfully.",
    })

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Availability</h2>
        <p className="text-muted-foreground">Manage your availability for bookings and appointments.</p>
      </div>

      <Tabs defaultValue="weekly">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="specific">Specific Dates</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Availability</CardTitle>
              <CardDescription>Set your regular working hours for each day of the week.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {daysOfWeek.map((day) => {
                  const slot = timeSlots.find((slot) => slot.day === day.id)
                  if (!slot) return null

                  return (
                    <div key={day.id} className="flex items-center space-x-4">
                      <div className="w-28">
                        <Label>{day.label}</Label>
                      </div>
                      <Switch
                        checked={slot.isAvailable}
                        onCheckedChange={(checked) => handleTimeSlotChange(slot.id, "isAvailable", checked)}
                      />
                      <div className="flex flex-1 items-center space-x-2">
                        <Select
                          value={slot.startTime}
                          onValueChange={(value) => handleTimeSlotChange(slot.id, "startTime", value)}
                          disabled={!slot.isAvailable}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Start time" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 13 }, (_, i) => i + 8).map((hour) => (
                              <SelectItem key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                                {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-muted-foreground">to</span>
                        <Select
                          value={slot.endTime}
                          onValueChange={(value) => handleTimeSlotChange(slot.id, "endTime", value)}
                          disabled={!slot.isAvailable}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="End time" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 13 }, (_, i) => i + 9).map((hour) => (
                              <SelectItem key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                                {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specific" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Specific Dates</CardTitle>
              <CardDescription>
                Mark specific dates as unavailable (holidays, vacations, etc.) or set special hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-medium">Add Date Exception</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="available"
                        checked={!dateAvailable}
                        onCheckedChange={(checked) => setDateAvailable(!checked)}
                      />
                      <Label htmlFor="available">Mark as unavailable</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason (optional)</Label>
                      <Input
                        id="reason"
                        value={dateReason}
                        onChange={(e) => setDateReason(e.target.value)}
                        placeholder="e.g., Holiday, Vacation, etc."
                      />
                    </div>
                    <Button onClick={handleAddSpecificDate} disabled={!selectedDate}>
                      <Plus className="mr-2 h-4 w-4" /> Add Date
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-medium">Date Exceptions</h3>
                  {specificDates.length === 0 ? (
                    <p className="text-muted-foreground">No specific dates added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {specificDates.map((date) => (
                        <div key={date.id} className="flex items-center justify-between rounded-md border p-3">
                          <div>
                            <p className="font-medium">
                              {date.date.toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {date.isAvailable ? "Available" : "Unavailable"}
                              {date.reason && ` - ${date.reason}`}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveSpecificDate(date.id)}>
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveAvailability} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Availability
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
