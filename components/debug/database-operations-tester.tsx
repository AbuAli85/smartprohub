"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Database, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { db } from "@/lib/neon/client"
import { DatabaseFallbackNotice } from "@/components/debug/database-fallback-notice"

type TestResult = "success" | "error" | "pending" | "skipped"

interface DbOperation {
  name: string
  description: string
  table: string
  operation: "create" | "read" | "update" | "delete" | "count"
  result: TestResult
  message: string
  duration?: number
  data?: any
}

export function DatabaseOperationsTester() {
  const [currentRole, setCurrentRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [selectedDb, setSelectedDb] = useState<"supabase" | "neon">("supabase")
  const [testResults, setTestResults] = useState<Record<string, DbOperation[]>>({
    profiles: [
      {
        name: "Count Profiles",
        description: "Count the number of profiles in the database",
        table: "profiles",
        operation: "count",
        result: "pending",
        message: "Not tested yet",
      },
      {
        name: "Read Profile",
        description: "Read the current user's profile",
        table: "profiles",
        operation: "read",
        result: "pending",
        message: "Not tested yet",
      },
      {
        name: "Create Test Profile",
        description: "Create a temporary test profile",
        table: "profiles",
        operation: "create",
        result: "pending",
        message: "Not tested yet",
      },
      {
        name: "Update Test Profile",
        description: "Update the temporary test profile",
        table: "profiles",
        operation: "update",
        result: "pending",
        message: "Not tested yet",
      },
      {
        name: "Delete Test Profile",
        description: "Delete the temporary test profile",
        table: "profiles",
        operation: "delete",
        result: "pending",
        message: "Not tested yet",
      },
    ],
    services: [
      {
        name: "Count Services",
        description: "Count the number of services in the database",
        table: "services",
        operation: "count",
        result: "pending",
        message: "Not tested yet",
      },
      {
        name: "Read Services",
        description: "Read services from the database",
        table: "services",
        operation: "read",
        result: "pending",
        message: "Not tested yet",
      },
      {
        name: "Create Test Service",
        description: "Create a temporary test service",
        table: "services",
        operation: "create",
        result: "pending",
        message: "Not tested yet",
      },
      {
        name: "Update Test Service",
        description: "Update the temporary test service",
        table: "services",
        operation: "update",
        result: "pending",
        message: "Not tested yet",
      },
      {
        name: "Delete Test Service",
        description: "Delete the temporary test service",
        table: "services",
        operation: "delete",
        result: "pending",
        message: "Not tested yet",
      },
    ],
    bookings: [
      {
        name: "Count Bookings",
        description: "Count the number of bookings in the database",
        table: "bookings",
        operation: "count",
        result: "pending",
        message: "Not tested yet",
      },
      {
        name: "Read Bookings",
        description: "Read bookings from the database",
        table: "bookings",
        operation: "read",
        result: "pending",
        message: "Not tested yet",
      },
    ],
  })

  useEffect(() => {
    async function getUserRole() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setCurrentRole(null)
          setIsLoading(false)
          return
        }

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        setCurrentRole(profile?.role || null)
      } catch (error) {
        console.error("Error fetching user role:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getUserRole()
  }, [])

  const runDatabaseTests = async () => {
    setIsRunningTests(true)

    // Reset all test results
    const resetResults = { ...testResults }
    Object.keys(resetResults).forEach((table) => {
      resetResults[table].forEach((test) => {
        test.result = "pending"
        test.message = "Testing..."
        test.duration = undefined
        test.data = undefined
      })
    })
    setTestResults(resetResults)

    // Create a temporary ID for test records
    const testId = `test-${Date.now()}`

    // Run tests for each table
    for (const table of Object.keys(testResults)) {
      await runTableTests(table, testId)
    }

    setIsRunningTests(false)
  }

  const runTableTests = async (table: string, testId: string) => {
    const updatedResults = { ...testResults }
    const tests = updatedResults[table]

    // Run each test in sequence
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]

      // Skip tests that depend on previous tests if those failed
      if (i > 0 && ["create", "update", "delete"].includes(test.operation)) {
        const prevCreateTest = tests.find((t) => t.operation === "create")
        if (prevCreateTest && prevCreateTest.result === "error" && test.operation !== "create") {
          test.result = "skipped"
          test.message = "Skipped because create operation failed"
          setTestResults({ ...updatedResults })
          continue
        }
      }

      try {
        const startTime = performance.now()

        if (selectedDb === "supabase") {
          await runSupabaseTest(test, table, testId)
        } else {
          await runNeonTest(test, table, testId)
        }

        const endTime = performance.now()
        test.duration = Math.round(endTime - startTime)
      } catch (error) {
        test.result = "error"
        test.message = `Test failed: ${error.message}`
      }

      setTestResults({ ...updatedResults })

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }

  const runSupabaseTest = async (test: DbOperation, table: string, testId: string) => {
    switch (test.operation) {
      case "count":
        const { count, error: countError } = await supabase.from(table).select("*", { count: "exact", head: true })

        if (countError) throw new Error(countError.message)

        test.result = "success"
        test.message = `Found ${count} records in ${table} table`
        test.data = { count }
        break

      case "read":
        const { data, error: readError } = await supabase.from(table).select("*").limit(5)

        if (readError) throw new Error(readError.message)

        test.result = "success"
        test.message = `Successfully read ${data.length} records from ${table} table`
        test.data = { records: data }
        break

      case "create":
        let createData: any = {}

        if (table === "profiles") {
          createData = {
            id: testId,
            full_name: "Test User",
            email: `test-${testId}@example.com`,
            role: "client",
          }
        } else if (table === "services") {
          createData = {
            id: testId,
            name: "Test Service",
            description: "This is a test service",
            price: 99.99,
            duration: 60,
            category: "test",
          }
        }

        const { data: createdData, error: createError } = await supabase.from(table).insert(createData).select()

        if (createError) throw new Error(createError.message)

        test.result = "success"
        test.message = `Successfully created test record in ${table} table`
        test.data = { created: createData }
        break

      case "update":
        let updateData: any = {}

        if (table === "profiles") {
          updateData = {
            full_name: "Updated Test User",
          }
        } else if (table === "services") {
          updateData = {
            name: "Updated Test Service",
            price: 149.99,
          }
        }

        const { data: updatedData, error: updateError } = await supabase
          .from(table)
          .update(updateData)
          .eq("id", testId)
          .select()

        if (updateError) throw new Error(updateError.message)

        test.result = "success"
        test.message = `Successfully updated test record in ${table} table`
        test.data = { updated: updateData }
        break

      case "delete":
        const { error: deleteError } = await supabase.from(table).delete().eq("id", testId)

        if (deleteError) throw new Error(deleteError.message)

        test.result = "success"
        test.message = `Successfully deleted test record from ${table} table`
        break
    }
  }

  const runNeonTest = async (test: DbOperation, table: string, testId: string) => {
    switch (test.operation) {
      case "count":
        const countResult = await db.query(`SELECT COUNT(*) FROM ${table}`)

        test.result = "success"
        test.message = `Found ${countResult.rows[0].count} records in ${table} table`
        test.data = { count: Number.parseInt(countResult.rows[0].count) }
        break

      case "read":
        const readResult = await db.query(`SELECT * FROM ${table} LIMIT 5`)

        test.result = "success"
        test.message = `Successfully read ${readResult.rows.length} records from ${table} table`
        test.data = { records: readResult.rows }
        break

      case "create":
        let createSql = ""
        let createParams: any[] = []

        if (table === "profiles") {
          createSql = `
            INSERT INTO profiles (id, full_name, email, role, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *
          `
          createParams = [testId, "Test User", `test-${testId}@example.com`, "client"]
        } else if (table === "services") {
          createSql = `
            INSERT INTO services (id, name, description, price, duration, category, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING *
          `
          createParams = [testId, "Test Service", "This is a test service", 99.99, 60, "test"]
        }

        const createResult = await db.query(createSql, createParams)

        test.result = "success"
        test.message = `Successfully created test record in ${table} table`
        test.data = { created: createResult.rows[0] }
        break

      case "update":
        let updateSql = ""
        let updateParams: any[] = []

        if (table === "profiles") {
          updateSql = `
            UPDATE profiles
            SET full_name = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
          `
          updateParams = ["Updated Test User", testId]
        } else if (table === "services") {
          updateSql = `
            UPDATE services
            SET name = $1, price = $2
            WHERE id = $3
            RETURNING *
          `
          updateParams = ["Updated Test Service", 149.99, testId]
        }

        const updateResult = await db.query(updateSql, updateParams)

        test.result = "success"
        test.message = `Successfully updated test record in ${table} table`
        test.data = { updated: updateResult.rows[0] }
        break

      case "delete":
        const deleteSql = `DELETE FROM ${table} WHERE id = $1`
        await db.query(deleteSql, [testId])

        test.result = "success"
        test.message = `Successfully deleted test record from ${table} table`
        break
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading database information...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentRole) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          You need to be logged in to run database operation tests.
          <div className="mt-4">
            <Button variant="outline" onClick={() => (window.location.href = "/auth/login")}>
              Go to Login
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  const allTests = Object.values(testResults).flat()
  const successCount = allTests.filter((t) => t.result === "success").length
  const errorCount = allTests.filter((t) => t.result === "error").length
  const pendingCount = allTests.filter((t) => t.result === "pending").length
  const skippedCount = allTests.filter((t) => t.result === "skipped").length

  return (
    <div className="space-y-6">
      {/* Show database fallback notice if needed */}
      {testResults?.error?.includes("No database URL") && <DatabaseFallbackNotice />}

      {/* Rest of the component */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Database Operations Testing</CardTitle>
              <CardDescription>Testing CRUD operations against the database</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedDb === "supabase" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDb("supabase")}
              >
                Supabase
              </Button>
              <Button
                variant={selectedDb === "neon" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDb("neon")}
              >
                Neon PostgreSQL
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Database className="h-4 w-4" />
            <AlertTitle>Testing with {selectedDb === "supabase" ? "Supabase" : "Neon PostgreSQL"}</AlertTitle>
            <AlertDescription>
              Running database operations against the {selectedDb === "supabase" ? "Supabase" : "Neon PostgreSQL"}{" "}
              database.
              {currentRole !== "admin" && (
                <p className="mt-2 text-amber-600">
                  Note: Some operations may fail if your role ({currentRole}) doesn't have sufficient permissions.
                </p>
              )}
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="profiles">
            <TabsList className="mb-4">
              <TabsTrigger value="profiles">Profiles</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>

            {Object.keys(testResults).map((table) => (
              <TabsContent key={table} value={table} className="space-y-4">
                {testResults[table].map((test, index) => (
                  <DbOperationCard key={index} test={test} />
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Badge variant="outline">
              <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
              {successCount} passed
            </Badge>
            {errorCount > 0 && (
              <Badge variant="outline" className="text-red-500">
                <XCircle className="mr-1 h-3 w-3 text-red-500" />
                {errorCount} failed
              </Badge>
            )}
            {skippedCount > 0 && (
              <Badge variant="outline" className="text-amber-500">
                <Clock className="mr-1 h-3 w-3 text-amber-500" />
                {skippedCount} skipped
              </Badge>
            )}
            {pendingCount > 0 && (
              <Badge variant="outline" className="text-gray-500">
                {pendingCount} pending
              </Badge>
            )}
          </div>
          <Button onClick={runDatabaseTests} disabled={isRunningTests}>
            {isRunningTests ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>Run Database Tests</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function DbOperationCard({ test }: { test: DbOperation }) {
  const [showData, setShowData] = useState(false)

  const getResultIcon = () => {
    switch (test.result) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "skipped":
        return <Clock className="h-5 w-5 text-amber-500" />
      default:
        return <RefreshCw className="h-5 w-5 text-gray-400" />
    }
  }

  const getResultBadge = () => {
    switch (test.result) {
      case "success":
        return <Badge variant="success">Success</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "skipped":
        return <Badge variant="warning">Skipped</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{test.name}</CardTitle>
          {getResultBadge()}
        </div>
        <CardDescription>{test.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Table</p>
            <p className="font-medium">{test.table}</p>
          </div>
          <div>
            <p className="text-gray-500">Operation</p>
            <p className="font-medium capitalize">{test.operation}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-medium capitalize">{test.result}</p>
          </div>
          <div>
            <p className="text-gray-500">Duration</p>
            <p className="font-medium">{test.duration ? `${test.duration}ms` : "N/A"}</p>
          </div>
        </div>

        {test.result !== "pending" && (
          <div className="mt-4 flex items-center gap-2">
            {getResultIcon()}
            <p className="text-sm">{test.message}</p>
          </div>
        )}

        {test.data && (
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setShowData(!showData)}>
              {showData ? "Hide" : "Show"} Data
            </Button>

            {showData && (
              <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-xs">
                {JSON.stringify(test.data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
