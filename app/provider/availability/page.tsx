"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Loader2, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
]

const TIME_SLOTS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4)
  const minute = (i % 4) * 15
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
})

export default function ProviderAvailabilityPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [regularSchedule, setRegularSchedule] = useState<any[]>([])
  const [exceptions, setExceptions] = useState<any[]>([])
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState("weekly")

  useEffect(() => {
    async function fetchAvailability() {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) return

        const providerId = session.session.user.id

        // Fetch regular schedule
        const { data: scheduleData, error: scheduleError } = await supabase
          .from("provider_availability")
          .select("*")
          .eq("provider_id", providerId)
          .eq("type", "regular")

        if (scheduleError) throw scheduleError

        // Fetch exceptions
        const { data: exceptionsData, error: exceptionsError } = await supabase
          .from("provider_availability")
          .select("*")
          .eq("provider_id", providerId)
          .eq("type", "exception")

        if (exceptionsError) throw exceptionsError

        // Initialize regular schedule if empty
        if (!scheduleData || scheduleData.length === 0) {
          const initialSchedule = DAYS_OF_WEEK.map((day) => ({
            day_of_week: day.value,
            is_available: day.value !== "saturday" && day.value !== "sunday",
            start_time: "09:00",
            end_time: "17:00",
            provider_id: providerId,
            type: "regular",
          }))

          setRegularSchedule(initialSchedule)
        } else {
          setRegularSchedule(scheduleData)
        }

        setExceptions(exceptionsData || [])
      } catch (error: any) {
        console.error("Error fetching availability:", error)
        toast({
          title: "Error",
          description: "Failed to load availability settings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [])

  const handleRegularScheduleChange = (index: number, field: string, value: any) => {
    setRegularSchedule((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleSaveSchedule = async () => {
    try {
      setSaving(true)
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const providerId = session.session.user.id

      // Delete existing regular schedule
      await supabase.from("provider_availability").delete().eq("provider_id", providerId).eq("type", "regular")

      // Insert new regular schedule
      const { error } = await supabase.from("provider_availability").insert(
        regularSchedule.map((schedule) => ({
          provider_id: providerId,
          type: "regular",
          day_of_week: schedule.day_of_week,
          is_available: schedule.is_available,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
        })),
      )

      if (error) throw error

      toast({
        title: "Success",
        description: "Your availability has been updated",
      })
    } catch (error: any) {
      console.error("Error saving schedule:", error)
      toast({
        title: "Error",
        description: "Failed to save availability settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addException = async () => {
    if (!date) return

    try {
      setSaving(true)
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const providerId = session.session.user.id
      const formattedDate = date.toISOString().split("T")[0]

      // Check if exception already exists
      const existingException = exceptions.find((e) => e.exception_date === formattedDate)

      if (existingException) {
        toast({
          title: "Exception already exists",
          description: "You already have an exception for this date",
          variant: "destructive",
        })
        return
      }

      // Create new exception
      const newException = {
        provider_id: providerId,
        type: "exception",
        exception_date: formattedDate,
        is_available: false,
        start_time: null,
        end_time: null,
      }

      const { data, error } = await supabase.from("provider_availability").insert(newException).select()

      if (error) throw error

      setExceptions((prev) => [...prev, data[0]])

      toast({
        title: "Success",
        description: "Exception added successfully",
      })
    } catch (error: any) {
      console.error("Error adding exception:", error)
      toast({
        title: "Error",
        description: "Failed to add exception",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const removeException = async (exceptionId: string) => {
    try {
      setSaving(true)

      const { error } = await supabase.from("provider_availability").delete().eq("id", exceptionId)

      if (error) throw error

      setExceptions((prev) => prev.filter((e) => e.id !== exceptionId))

      toast({
        title: "Success",
        description: "Exception removed successfully",
      })
    } catch (error: any) {
      console.error("Error removing exception:", error)
      toast({
        title: "Error",
        description: "Failed to remove exception",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
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
        <h1 className="text-3xl font-bold">Availability</h1>
        <Button onClick={handleSaveSchedule} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="weekly" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regular Weekly Schedule</CardTitle>
              <CardDescription>Set your regular working hours for each day of the week.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {regularSchedule.map((schedule, index) => (
                  <div key={schedule.day_of_week} className="flex items-center gap-4">
                    <div className="w-32">
                      <Label>{DAYS_OF_WEEK.find((d) => d.value === schedule.day_of_week)?.label}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={schedule.is_available}
                        onCheckedChange={(checked) => handleRegularScheduleChange(index, "is_available", checked)}
                      />
                      <Label>Available</Label>
                    </div>
                    {schedule.is_available && (
                      <>
                        <div className="flex items-center gap-2">
                          <Label>From</Label>
                          <Select
                            value={schedule.start_time}
                            onValueChange={(value) => handleRegularScheduleChange(index, "start_time", value)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Start time" />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_SLOTS.filter((time) => time < schedule.end_time).map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label>To</Label>
                          <Select
                            value={schedule.end_time}
                            onValueChange={(value) => handleRegularScheduleChange(index, "end_time", value)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="End time" />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_SLOTS.filter((time) => time > schedule.start_time).map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Exception</CardTitle>
                <CardDescription>Mark specific dates as unavailable or with special hours.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                  <Button onClick={addException} disabled={!date || saving} className="w-full">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Mark as Unavailable
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Exceptions</CardTitle>
                <CardDescription>Dates you've marked as unavailable.</CardDescription>
              </CardHeader>
              <CardContent>
                {exceptions.length === 0 ? (
                  <div className="flex h-[200px] items-center justify-center">
                    <p className="text-center text-muted-foreground">No exceptions set</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {exceptions.map((exception) => (
                      <div key={exception.id} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="font-medium">
                            {new Date(exception.exception_date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">Marked as unavailable</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeException(exception.id)}
                          disabled={saving}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
