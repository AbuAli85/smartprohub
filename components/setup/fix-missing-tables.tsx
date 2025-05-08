"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Database } from "lucide-react"

export function FixMissingTables() {
  const [isFixing, setIsFixing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)

  const fixMissingTables = async () => {
    try {
      setIsFixing(true)
      setError(null)

      const response = await fetch("/api/setup/database/fix-missing-tables", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const data = await response.json()
      setResults(data)
      setIsSuccess(true)
    } catch (error: any) {
      console.error("Error fixing missing tables:", error)
      setError(error.message || "An unexpected error occurred")
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fix Missing Database Tables</CardTitle>
        <CardDescription>
          Create missing database tables (bookings and messages) required for the application to function properly.
        </CardDescription>
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
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Tables Created Successfully</AlertTitle>
            <AlertDescription className="text-green-700">
              <div className="mt-2">
                <p className="font-medium">Tables Status:</p>
                <ul className="mt-1 list-disc pl-5">
                  <li>Bookings: {results?.tablesCheck?.bookings_exists ? "Created ✓" : "Failed ✗"}</li>
                  <li>Messages: {results?.tablesCheck?.messages_exists ? "Created ✓" : "Failed ✗"}</li>
                  <li>Conversations: {results?.tablesCheck?.conversations_exists ? "Created ✓" : "Failed ✗"}</li>
                  <li>
                    Conversation Participants: {results?.tablesCheck?.participants_exists ? "Created ✓" : "Failed ✗"}
                  </li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <p>This utility will:</p>
          <ul className="list-disc pl-5">
            <li>
              Create the missing <strong>bookings</strong> table with proper relationships
            </li>
            <li>
              Create the missing <strong>messages</strong> table with proper relationships
            </li>
            <li>Create supporting tables for messaging (conversations, participants)</li>
            <li>Set up proper indexes for performance optimization</li>
            <li>Configure Row Level Security (RLS) policies for data protection</li>
          </ul>

          <Alert>
            <Database className="h-4 w-4" />
            <AlertTitle>Database Check</AlertTitle>
            <AlertDescription>
              The database check detected that the following tables are missing:
              <ul className="mt-2 list-disc pl-5">
                <li>
                  <strong>bookings</strong> - Required for appointment scheduling
                </li>
                <li>
                  <strong>messages</strong> - Required for communication between users
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={fixMissingTables} disabled={isFixing || isSuccess}>
          {isFixing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Tables...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Tables Created
            </>
          ) : (
            "Fix Missing Tables"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
