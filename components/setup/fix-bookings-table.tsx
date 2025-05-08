"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CardFooter } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

// Make all props optional with default values
export function FixBookingsTable() {
  const [isFixing, setIsFixing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add state for seeding
  const [isSeeding, setIsSeeding] = useState(false)
  const [isSeedingSuccess, setIsSeedingSuccess] = useState(false)
  const [seedingError, setSeedingError] = useState<string | null>(null)

  // Implement fixBookingsTable function directly in the component
  const fixBookingsTable = async () => {
    try {
      setIsFixing(true)
      setError(null)

      const response = await fetch("/api/setup/database/fix-bookings-table", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const data = await response.json()
      setIsSuccess(true)
    } catch (error: any) {
      console.error("Error creating bookings table:", error)
      setError(error.message || "An unexpected error occurred")
    } finally {
      setIsFixing(false)
    }
  }

  // Add seedBookings function
  const seedBookings = async () => {
    try {
      setIsSeeding(true)
      setSeedingError(null)

      const response = await fetch("/api/setup/database/seed-bookings", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const data = await response.json()
      setIsSeedingSuccess(true)
    } catch (error: any) {
      console.error("Error seeding bookings:", error)
      setSeedingError(error.message || "An unexpected error occurred")
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <>
      {isSuccess && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Bookings Table Created</AlertTitle>
          <AlertDescription className="text-green-700">
            The bookings table has been successfully created in the database.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Creating Bookings Table</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSeedingSuccess && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Sample Bookings Added</AlertTitle>
          <AlertDescription className="text-green-700">
            Sample booking data has been added to the database for testing.
          </AlertDescription>
        </Alert>
      )}

      {seedingError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Adding Sample Data</AlertTitle>
          <AlertDescription>{seedingError}</AlertDescription>
        </Alert>
      )}

      <CardFooter className="flex justify-between">
        <Button onClick={fixBookingsTable} disabled={isFixing} className="bg-blue-600 hover:bg-blue-700">
          {isFixing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Bookings Table...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Bookings Table Created
            </>
          ) : (
            "Create Bookings Table"
          )}
        </Button>

        {isSuccess && (
          <Button onClick={seedBookings} disabled={isSeeding || isSeedingSuccess} variant="outline">
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Sample Data...
              </>
            ) : isSeedingSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Sample Data Added
              </>
            ) : (
              "Add Sample Bookings"
            )}
          </Button>
        )}
      </CardFooter>
    </>
  )
}
