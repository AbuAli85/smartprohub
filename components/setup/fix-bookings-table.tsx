"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CardFooter, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2, Info, RefreshCw } from "lucide-react"

export function FixBookingsTable() {
  const [isFixing, setIsFixing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  // Complete fix function
  const fixBookingsComplete = async () => {
    try {
      setIsFixing(true)
      setError(null)
      setResult(null)

      const response = await fetch("/api/setup/database/fix-bookings-complete", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`)
      }

      setIsSuccess(true)
      setResult(data)
    } catch (error: any) {
      console.error("Error fixing bookings:", error)
      setError(error.message || "An unexpected error occurred")
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bookings Table Setup</CardTitle>
        <CardDescription>Create the bookings table and add sample data for testing</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Bookings Table Created</AlertTitle>
            <AlertDescription className="text-green-700">
              {result?.bookingsCreated
                ? `The bookings table has been created and ${result.count} sample bookings have been added.`
                : "The bookings table has been created successfully."}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Setting Up Bookings</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Complete Setup</AlertTitle>
          <AlertDescription className="text-blue-700">
            This will drop and recreate the bookings table, then add sample data in a single operation. Any existing
            bookings data will be lost.
          </AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Button onClick={fixBookingsComplete} disabled={isFixing} className="bg-blue-600 hover:bg-blue-700">
          {isFixing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting Up Bookings...
            </>
          ) : isSuccess ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Recreate Bookings Table
            </>
          ) : (
            "Complete Bookings Setup"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
