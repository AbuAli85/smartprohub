"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function NotificationsSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const setupNotifications = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/setup/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to set up notifications")
      }

      setIsComplete(true)
      toast({
        title: "Success",
        description: "Notifications system has been set up successfully",
      })
    } catch (error: any) {
      console.error("Error setting up notifications:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to set up notifications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Set Up Notifications</CardTitle>
          <CardDescription>Set up the database tables and triggers needed for the notifications system</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will create the necessary database tables and triggers for the notifications system, including message
            notifications, booking notifications, and more.
          </p>

          {isComplete && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle className="h-5 w-5" />
              <span>Notifications system has been set up successfully</span>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={setupNotifications} disabled={isLoading || isComplete} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : isComplete ? (
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
    </div>
  )
}
