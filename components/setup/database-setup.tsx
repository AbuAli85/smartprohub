"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Database, AlertCircle, Loader2 } from "lucide-react"

export function DatabaseSetup() {
  const [isCreatingTables, setIsCreatingTables] = useState(false)
  const [isCreatingTablesSuccess, setIsCreatingTablesSuccess] = useState(false)
  const [isCreatingTablesError, setIsCreatingTablesError] = useState<string | null>(null)

  const [isSeedingData, setIsSeedingData] = useState(false)
  const [isSeedingDataSuccess, setIsSeedingDataSuccess] = useState(false)
  const [isSeedingDataError, setIsSeedingDataError] = useState<string | null>(null)

  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isTestingConnectionSuccess, setIsTestingConnectionSuccess] = useState(false)
  const [isTestingConnectionError, setIsTestingConnectionError] = useState<string | null>(null)
  const [connectionData, setConnectionData] = useState<any>(null)

  const testConnection = async () => {
    setIsTestingConnection(true)
    setIsTestingConnectionSuccess(false)
    setIsTestingConnectionError(null)

    try {
      const response = await fetch("/api/test/postgres")
      const data = await response.json()

      if (response.ok) {
        setIsTestingConnectionSuccess(true)
        setConnectionData(data)
      } else {
        setIsTestingConnectionError(data.error || "Failed to connect to database")
      }
    } catch (error: any) {
      setIsTestingConnectionError(error.message || "An unexpected error occurred")
    } finally {
      setIsTestingConnection(false)
    }
  }

  const createTables = async () => {
    setIsCreatingTables(true)
    setIsCreatingTablesSuccess(false)
    setIsCreatingTablesError(null)

    try {
      const response = await fetch("/api/setup/database/tables", {
        method: "POST",
      })
      const data = await response.json()

      if (response.ok) {
        setIsCreatingTablesSuccess(true)
      } else {
        setIsCreatingTablesError(data.error || "Failed to create tables")
      }
    } catch (error: any) {
      setIsCreatingTablesError(error.message || "An unexpected error occurred")
    } finally {
      setIsCreatingTables(false)
    }
  }

  const seedData = async () => {
    setIsSeedingData(true)
    setIsSeedingDataSuccess(false)
    setIsSeedingDataError(null)

    try {
      const response = await fetch("/api/setup/database/seed", {
        method: "POST",
      })
      const data = await response.json()

      if (response.ok) {
        setIsSeedingDataSuccess(true)
      } else {
        setIsSeedingDataError(data.error || "Failed to seed data")
      }
    } catch (error: any) {
      setIsSeedingDataError(error.message || "An unexpected error occurred")
    } finally {
      setIsSeedingData(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          Database Setup
        </CardTitle>
        <CardDescription>Set up your PostgreSQL database for SmartPRO Business Services Hub</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Connection */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Step 1: Test Database Connection</h3>
          <p className="text-sm text-gray-500">Verify that your PostgreSQL connection is working properly.</p>

          {isTestingConnectionSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Connection Successful</AlertTitle>
              <AlertDescription>
                Successfully connected to the PostgreSQL database.
                {connectionData && (
                  <div className="mt-2 text-xs bg-green-100 p-2 rounded">
                    <div>Server time: {connectionData.server_time}</div>
                    <div>Connection: {connectionData.connection}</div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {isTestingConnectionError && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle>Connection Failed</AlertTitle>
              <AlertDescription>{isTestingConnectionError}</AlertDescription>
            </Alert>
          )}

          <Button onClick={testConnection} disabled={isTestingConnection} variant="outline">
            {isTestingConnection && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isTestingConnection ? "Testing Connection..." : "Test Connection"}
          </Button>
        </div>

        {/* Create Tables */}
        <div className="space-y-2 pt-4 border-t">
          <h3 className="text-lg font-medium">Step 2: Create Database Tables</h3>
          <p className="text-sm text-gray-500">Create the necessary tables for your application.</p>

          {isCreatingTablesSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Tables Created</AlertTitle>
              <AlertDescription>Database tables were created successfully.</AlertDescription>
            </Alert>
          )}

          {isCreatingTablesError && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle>Error Creating Tables</AlertTitle>
              <AlertDescription>{isCreatingTablesError}</AlertDescription>
            </Alert>
          )}

          <Button onClick={createTables} disabled={isCreatingTables || !isTestingConnectionSuccess} variant="outline">
            {isCreatingTables && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCreatingTables ? "Creating Tables..." : "Create Tables"}
          </Button>
        </div>

        {/* Seed Data */}
        <div className="space-y-2 pt-4 border-t">
          <h3 className="text-lg font-medium">Step 3: Seed Sample Data</h3>
          <p className="text-sm text-gray-500">Add sample data to your database for testing.</p>

          {isSeedingDataSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Data Seeded</AlertTitle>
              <AlertDescription>Sample data was added to your database successfully.</AlertDescription>
            </Alert>
          )}

          {isSeedingDataError && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle>Error Seeding Data</AlertTitle>
              <AlertDescription>{isSeedingDataError}</AlertDescription>
            </Alert>
          )}

          <Button onClick={seedData} disabled={isSeedingData || !isCreatingTablesSuccess} variant="outline">
            {isSeedingData && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSeedingData ? "Seeding Data..." : "Seed Sample Data"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-sm text-gray-500">Complete all steps to set up your database.</p>
        <Button disabled={!isSeedingDataSuccess} onClick={() => (window.location.href = "/dashboard")}>
          Go to Dashboard
        </Button>
      </CardFooter>
    </Card>
  )
}
