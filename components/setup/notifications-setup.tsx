"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export function NotificationsSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setupNotifications = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/setup/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to set up notifications")
      }

      setIsSuccess(true)
    } catch (err: any) {
      console.error("Error setting up notifications:", err)
      setError(err.message || "An error occurred while setting up notifications")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Up Notifications</CardTitle>
        <CardDescription>Create the notifications table and triggers for real-time notifications</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isSuccess && (
          <Alert className="mb-4 border-green-500 text-green-500">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Notifications have been set up successfully. The system will now generate notifications for messages and
              bookings.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <p>This will set up the notifications system for your application, including:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Creating the notifications table</li>
            <li>Setting up triggers for message notifications</li>
            <li>Setting up triggers for booking notifications</li>
            <li>Creating indexes for better performance</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={setupNotifications} disabled={isLoading || isSuccess}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting Up...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Setup Complete
            </>
          ) : (
            "Set Up Notifications"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
