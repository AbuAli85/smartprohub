"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { demoBookings } from "@/lib/demo-data"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function RecentBookings() {
  const [loading, setLoading] = useState(false)

  // Simulate loading for better UX
  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return timeString || "N/A"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[160px]" />
              </div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Recent Bookings</h3>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Information</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Showing demo data. Database access is limited.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      <Alert variant="warning" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Demo Mode</AlertTitle>
        <AlertDescription>Showing sample data. Database access is limited or unavailable.</AlertDescription>
      </Alert>

      <div className="space-y-8">
        {demoBookings.map((booking) => (
          <div key={booking.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src={booking.provider?.avatar_url || ""} alt={booking.provider?.full_name || ""} />
              <AvatarFallback>{booking.provider?.full_name?.[0] || "P"}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{booking.provider?.full_name || "Service Provider"}</p>
              <p className="text-sm text-muted-foreground">{booking.service_name}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-medium">{formatDate(booking.date)}</p>
              <p className="text-sm text-muted-foreground">{formatTime(booking.time)}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
