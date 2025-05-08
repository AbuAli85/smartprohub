"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, RefreshCw, ArrowRight, Shield, Database, Info } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

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

  const [isValidatingSchema, setIsValidatingSchema] = useState(false)
  const [isValidatingSchemaSuccess, setIsValidatingSchemaSuccess] = useState(false)
  const [isValidatingSchemaError, setIsValidatingSchemaError] = useState<string | null>(null)
  const [validationResults, setValidationResults] = useState<any>(null)

  const [isFixingPolicies, setIsFixingPolicies] = useState(false)
  const [isFixingPoliciesSuccess, setIsFixingPoliciesSuccess] = useState(false)
  const [isFixingPoliciesError, setIsFixingPoliciesError] = useState<string | null>(null)

  const [isFixingColumns, setIsFixingColumns] = useState(false)
  const [isFixingColumnsSuccess, setIsFixingColumnsSuccess] = useState(false)
  const [isFixingColumnsError, setIsFixingColumnsError] = useState<string | null>(null)

  const [progress, setProgress] = useState(0)
  const [dbStatus, setDbStatus] = useState<"unknown" | "empty" | "exists" | "error">("unknown")

  // Check database status on load
  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    try {
      // First test connection
      const connectionResponse = await fetch("/api/test/postgres")

      if (!connectionResponse.ok) {
        setDbStatus("error")
        return
      }

      const connectionData = await connectionResponse.json()

      if (connectionData.status !== "success") {
        setDbStatus("error")
        return
      }

      // Then check if tables exist
      const schemaResponse = await fetch("/api/setup/database/validate-schema")

      if (!schemaResponse.ok) {
        setDbStatus("error")
        return
      }

      const schemaData = await schemaResponse.json()

      if (!schemaData.results || Object.keys(schemaData.results).length === 0) {
        setDbStatus("empty")
        return
      }

      // Check if any tables exist
      const hasAnyTables = Object.values(schemaData.results).some((exists: any) => exists === true)

      if (hasAnyTables) {
        setDbStatus("exists")
        setValidationResults(schemaData.results)

        // If all required tables exist, mark validation as successful
        const allTablesExist = Object.values(schemaData.results).every((exists: any) => exists === true)
        if (allTablesExist) {
          setIsValidatingSchemaSuccess(true)
          setProgress(25)
        }
      } else {
        setDbStatus("empty")
      }
    } catch (error) {
      console.error("Error checking database status:", error)
      setDbStatus("error")
    }
  }

  const checkTablesExist = async () => {
    try {
      const response = await fetch("/api/setup/database/validate-schema")
      const data = await response.json()

      if (response.ok) {
        setValidationResults(data.results)

        // If all required tables exist, mark validation as successful
        const allTablesExist = Object.values(data.results).every((exists: any) => exists === true)
        if (allTablesExist) {
          setIsValidatingSchemaSuccess(true)
          setProgress(25)
        }
      }
    } catch (error) {
      console.error("Error checking tables:", error)
    }
  }

  const testConnection = async () => {
    setIsTestingConnection(true)
    setIsTestingConnectionSuccess(false)
    setIsTestingConnectionError(null)

    try {
      const response = await fetch("/api/test/postgres")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const data = await response.json().catch(() => {
        throw new Error("Failed to parse response as JSON")
      })

      if (data.status === "success") {
        setIsTestingConnectionSuccess(true)
        setConnectionData(data)
        setProgress(25)

        // After successful connection, check if tables exist
        await checkTablesExist()
      } else {
        throw new Error(data.error || "Unknown database connection error")
      }
    } catch (error: any) {
      console.error("Connection test error:", error)
      setIsTestingConnectionError(error.message || "An unexpected error occurred")
    } finally {
      setIsTestingConnection(false)
    }
  }

  const validateSchema = async () => {
    setIsValidatingSchema(true)
    setIsValidatingSchemaSuccess(false)
    setIsValidatingSchemaError(null)

    try {
      const response = await fetch("/api/setup/database/validate-schema")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const data = await response.json().catch(() => {
        throw new Error("Failed to parse response as JSON")
      })

      setValidationResults(data.results)

      // If all required tables exist, mark validation as successful
      const allTablesExist = Object.values(data.results).every((exists: any) => exists === true)
      if (allTablesExist) {
        setIsValidatingSchemaSuccess(true)
        setProgress(50)
      } else {
        setIsValidatingSchemaError("Some required tables are missing. Please create tables.")
      }
    } catch (error: any) {
      setIsValidatingSchemaError(error.message || "An unexpected error occurred")
    } finally {
      setIsValidatingSchema(false)
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const data = await response.json().catch(() => {
        throw new Error("Failed to parse response as JSON")
      })

      setIsCreatingTablesSuccess(true)
      setProgress(75)

      // Validate schema after creating tables
      await validateSchema()
    } catch (error: any) {
      setIsCreatingTablesError(error.message || "An unexpected error occurred")
    } finally {
      setIsCreatingTables(false)
    }
  }

  const fixPolicies = async () => {
    setIsFixingPolicies(true)
    setIsFixingPoliciesSuccess(false)
    setIsFixingPoliciesError(null)

    try {
      const response = await fetch("/api/setup/database/fix-policies", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const data = await response.json().catch(() => {
        throw new Error("Failed to parse response as JSON")
      })

      setIsFixingPoliciesSuccess(true)
    } catch (error: any) {
      setIsFixingPoliciesError(error.message || "An unexpected error occurred")
    } finally {
      setIsFixingPolicies(false)
    }
  }

  const fixColumns = async () => {
    setIsFixingColumns(true)
    setIsFixingColumnsSuccess(false)
    setIsFixingColumnsError(null)

    try {
      const response = await fetch("/api/setup/database/fix-columns", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const data = await response.json().catch(() => {
        throw new Error("Failed to parse response as JSON")
      })

      setIsFixingColumnsSuccess(true)
    } catch (error: any) {
      setIsFixingColumnsError(error.message || "An unexpected error occurred")
    } finally {
      setIsFixingColumns(false)
    }
  }

  // Update the seedData function to use the simplified seed route
  const seedData = async () => {
    setIsSeedingData(true)
    setIsSeedingDataSuccess(false)
    setIsSeedingDataError(null)

    try {
      // Use the simplified seed route instead
      const response = await fetch("/api/setup/database/seed-simple", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const data = await response.json().catch(() => {
        throw new Error("Failed to parse response as JSON")
      })

      setIsSeedingDataSuccess(true)
      setProgress(100)
    } catch (error: any) {
      setIsSeedingDataError(error.message || "An unexpected error occurred")
    } finally {
      setIsSeedingData(false)
    }
  }

  const resetSetup = () => {
    setIsTestingConnectionSuccess(false)
    setIsValidatingSchemaSuccess(false)
    setIsCreatingTablesSuccess(false)
    setIsSeedingDataSuccess(false)
    setIsFixingPoliciesSuccess(false)
    setIsFixingColumnsSuccess(false)
    setProgress(0)
    checkDatabaseStatus()
  }

  return (
    <div className="space-y-6">
      <Progress value={progress} className="h-2 w-full" />

      {dbStatus === "empty" && (
        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Database is empty</AlertTitle>
          <AlertDescription className="text-amber-700">
            Your database connection is working, but no tables were found. Follow the steps below to set up your
            database.
          </AlertDescription>
        </Alert>
      )}

      {dbStatus === "exists" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Database tables detected</AlertTitle>
          <AlertDescription className="text-green-700">
            Some database tables already exist. You can continue with the setup process to create any missing tables.
          </AlertDescription>
        </Alert>
      )}

      {dbStatus === "error" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Database connection issues</AlertTitle>
          <AlertDescription className="text-red-700">
            There was a problem connecting to your database. Please check your database connection settings.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {/* Test Connection */}
        <Card className={isTestingConnectionSuccess ? "border-green-200" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">1</span>
              Test Database Connection
            </CardTitle>
            <CardDescription>Verify that your PostgreSQL connection is working properly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
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
                <AlertDescription>
                  {isTestingConnectionError}
                  <div className="mt-2 text-xs">
                    <p>Please check that:</p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Your database URL is correctly set in environment variables</li>
                      <li>The database server is running and accessible</li>
                      <li>Your network allows connections to the database</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={testConnection}
              disabled={isTestingConnection || isTestingConnectionSuccess}
              variant={isTestingConnectionSuccess ? "outline" : "default"}
            >
              {isTestingConnection && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isTestingConnection
                ? "Testing Connection..."
                : isTestingConnectionSuccess
                  ? "Connected"
                  : "Test Connection"}
            </Button>
          </CardFooter>
        </Card>

        {/* Database Utilities */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Database Utilities</CardTitle>
            <CardDescription>Tools to fix common database issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fix Columns Card */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4" />
                  Fix Missing Columns
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Add missing columns like 'provider_id' to tables that need them
                </p>
                <Button
                  onClick={fixColumns}
                  disabled={isFixingColumns || !isCreatingTablesSuccess}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  {isFixingColumns && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  {isFixingColumns ? "Fixing Columns..." : "Fix Columns"}
                </Button>
                {isFixingColumnsSuccess && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Columns fixed successfully
                  </p>
                )}
                {isFixingColumnsError && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {isFixingColumnsError}
                  </p>
                )}
              </div>

              {/* Fix Policies Card */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" />
                  Fix Database Policies
                </h3>
                <p className="text-xs text-gray-500 mb-3">Repair or recreate database policies that have conflicts</p>
                <Button
                  onClick={fixPolicies}
                  disabled={isFixingPolicies || !isCreatingTablesSuccess}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  {isFixingPolicies && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  {isFixingPolicies ? "Fixing Policies..." : "Fix Policies"}
                </Button>
                {isFixingPoliciesSuccess && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Policies fixed successfully
                  </p>
                )}
                {isFixingPoliciesError && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {isFixingPoliciesError}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validate Schema */}
        <Card className={isValidatingSchemaSuccess ? "border-green-200" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">2</span>
              Validate Database Schema
            </CardTitle>
            <CardDescription>Check if required database tables exist.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {validationResults && (
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(validationResults).map(([table, exists]: [string, any]) => (
                    <div key={table} className="flex items-center gap-2">
                      {exists ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      )}
                      <span className={exists ? "text-green-600" : "text-amber-600"}>
                        {table}: {exists ? "Exists" : "Missing"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isValidatingSchemaError && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Schema Validation</AlertTitle>
                <AlertDescription>{isValidatingSchemaError}</AlertDescription>
              </Alert>
            )}

            {isValidatingSchemaSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Schema Valid</AlertTitle>
                <AlertDescription>All required database tables exist.</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={validateSchema}
              disabled={isValidatingSchema || !isTestingConnectionSuccess || isValidatingSchemaSuccess}
              variant={isValidatingSchemaSuccess ? "outline" : "default"}
            >
              {isValidatingSchema && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isValidatingSchema
                ? "Validating Schema..."
                : isValidatingSchemaSuccess
                  ? "Schema Valid"
                  : "Validate Schema"}
            </Button>
          </CardFooter>
        </Card>

        {/* Create Tables */}
        <Card className={isCreatingTablesSuccess ? "border-green-200" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">3</span>
              Create Database Tables
            </CardTitle>
            <CardDescription>Create the necessary tables for your application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
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
                <AlertDescription>
                  {isCreatingTablesError}
                  {isCreatingTablesError?.includes("policy") && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">
                        Try using the "Fix Policies" button in the Database Utilities section.
                      </p>
                    </div>
                  )}
                  {isCreatingTablesError?.includes("column") && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">
                        Try using the "Fix Columns" button in the Database Utilities section.
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={createTables}
              disabled={isCreatingTables || !isTestingConnectionSuccess || isCreatingTablesSuccess}
              variant={isCreatingTablesSuccess ? "outline" : "default"}
            >
              {isCreatingTables && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreatingTables ? "Creating Tables..." : isCreatingTablesSuccess ? "Tables Created" : "Create Tables"}
            </Button>
          </CardFooter>
        </Card>

        {/* Seed Data */}
        <Card className={isSeedingDataSuccess ? "border-green-200" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">4</span>
              Seed Sample Data
            </CardTitle>
            <CardDescription>Add sample data to your database for testing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
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
          </CardContent>
          <CardFooter>
            <Button
              onClick={seedData}
              disabled={isSeedingData || !isCreatingTablesSuccess || isSeedingDataSuccess}
              variant={isSeedingDataSuccess ? "outline" : "default"}
            >
              {isSeedingData && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSeedingData ? "Seeding Data..." : isSeedingDataSuccess ? "Data Seeded" : "Seed Sample Data"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={resetSetup} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Reset Setup
        </Button>

        <Button disabled={!isSeedingDataSuccess} className="flex items-center gap-2" asChild>
          <Link href="/dashboard">
            Go to Dashboard
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
