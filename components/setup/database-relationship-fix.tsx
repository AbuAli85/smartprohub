"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2, XCircle, Info, Database } from "lucide-react"
import { Code } from "@/components/ui/code"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DatabaseRelationshipFix() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [detailedError, setDetailedError] = useState<any>(null)
  const [tablesExist, setTablesExist] = useState(false)
  const [checkingTables, setCheckingTables] = useState(true)

  // Check if tables exist on component mount
  useEffect(() => {
    checkTablesExist()
  }, [])

  const checkTablesExist = async () => {
    try {
      setCheckingTables(true)
      const response = await fetch("/api/setup/database/check-tables")

      if (!response.ok) {
        setTablesExist(false)
        return
      }

      const data = await response.json()
      setTablesExist(data.hasTables)
    } catch (error) {
      console.error("Error checking tables:", error)
      setTablesExist(false)
    } finally {
      setCheckingTables(false)
    }
  }

  const fixRelationships = async () => {
    try {
      setLoading(true)
      setError(null)
      setDetailedError(null)

      // First check if tables exist
      const checkResponse = await fetch("/api/setup/database/check-tables")
      const checkData = await checkResponse.json()

      if (!checkData.hasTables) {
        throw new Error("No tables found in database. Please run database setup first.")
      }

      const response = await fetch("/api/setup/database/fix-relationships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setDetailedError(data)
        throw new Error(data.message || "Failed to fix database relationships")
      }

      setResult(data)
    } catch (err: any) {
      console.error("Error fixing relationships:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fix Client-Provider Relationships</CardTitle>
        <CardDescription>
          This utility will fix the relationships between clients and providers in your database, ensuring proper
          connections for services, bookings, and messages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {checkingTables ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Checking database tables...</span>
          </div>
        ) : !tablesExist ? (
          <Alert className="mb-4 border-amber-200 bg-amber-50">
            <Database className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Database Tables Required</AlertTitle>
            <AlertDescription className="text-amber-700">
              <p className="font-medium">No tables found in database. Please run database setup first.</p>
              <div className="mt-4 rounded-md bg-amber-100 p-3">
                <p className="text-sm font-semibold">Steps to set up your database:</p>
                <ol className="mt-2 list-decimal pl-5 text-sm">
                  <li>Go to the "Database Setup" section</li>
                  <li>Click "Test Connection" to verify your database connection</li>
                  <li>Click "Create Tables" to create the required database tables</li>
                  <li>Click "Seed Sample Data" to populate your database</li>
                  <li>Return to this section after completing the above steps</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}

              {detailedError && (
                <Accordion type="single" collapsible className="mt-2">
                  <AccordionItem value="error-details">
                    <AccordionTrigger className="text-xs">View Error Details</AccordionTrigger>
                    <AccordionContent>
                      <Code className="mt-1 text-xs whitespace-pre-wrap">{JSON.stringify(detailedError, null, 2)}</Code>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              <div className="mt-4">
                <p className="text-sm font-medium">Troubleshooting Steps:</p>
                <ol className="list-decimal pl-5 text-sm">
                  <li>Ensure your database connection is working properly</li>
                  <li>Check if the database tables have been created</li>
                  <li>Try running the database setup process first</li>
                  <li>Check the browser console for more detailed error messages</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
            {result.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle>{result.success ? "Success" : "Errors Occurred"}</AlertTitle>
            <AlertDescription>
              {result.message}

              <Tabs defaultValue="operations" className="mt-4 w-full">
                <TabsList>
                  <TabsTrigger value="operations">Operations</TabsTrigger>
                  <TabsTrigger value="schema">Schema Info</TabsTrigger>
                </TabsList>

                <TabsContent value="operations">
                  <div className="max-h-60 overflow-y-auto rounded border p-2">
                    <ul className="space-y-2 text-sm">
                      {result.results &&
                        result.results.map((item: any, index: number) => (
                          <li key={index} className="rounded bg-gray-50 p-2 dark:bg-gray-800">
                            <div
                              className={`flex items-center gap-2 ${item.success ? "text-green-600" : "text-red-600"}`}
                            >
                              {item.success ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              <span className="font-medium">{item.description}</span>
                            </div>
                            {item.error && (
                              <div className="mt-1 text-xs text-red-500">
                                Error: {item.error}
                                {item.errorCode && <span className="block">Code: {item.errorCode}</span>}
                              </div>
                            )}
                            {item.result && <div className="mt-1 text-xs">Result: {JSON.stringify(item.result)}</div>}
                          </li>
                        ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="schema">
                  {result.schemaInfo && (
                    <div className="space-y-4">
                      {result.schemaInfo.tables && (
                        <div>
                          <p className="text-sm font-medium">Tables:</p>
                          <Code className="mt-1 text-xs">{result.schemaInfo.tables.join(", ")}</Code>
                        </div>
                      )}

                      {result.schemaInfo.profileColumns && (
                        <div>
                          <p className="text-sm font-medium">Profile Columns:</p>
                          <div className="max-h-40 overflow-y-auto rounded border p-2">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b">
                                  <th className="p-1 text-left">Column</th>
                                  <th className="p-1 text-left">Type</th>
                                  <th className="p-1 text-left">Nullable</th>
                                </tr>
                              </thead>
                              <tbody>
                                {result.schemaInfo.profileColumns.map((col: any, i: number) => (
                                  <tr key={i} className="border-b">
                                    <td className="p-1">{col.column_name}</td>
                                    <td className="p-1">{col.data_type}</td>
                                    <td className="p-1">{col.is_nullable}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {result.schemaInfo.constraints && (
                        <div>
                          <p className="text-sm font-medium">Foreign Key Constraints:</p>
                          <div className="max-h-40 overflow-y-auto rounded border p-2">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b">
                                  <th className="p-1 text-left">Constraint</th>
                                  <th className="p-1 text-left">Table</th>
                                  <th className="p-1 text-left">Column</th>
                                  <th className="p-1 text-left">References</th>
                                </tr>
                              </thead>
                              <tbody>
                                {result.schemaInfo.constraints.map((con: any, i: number) => (
                                  <tr key={i} className="border-b">
                                    <td className="p-1">{con.constraint_name}</td>
                                    <td className="p-1">{con.table_name}</td>
                                    <td className="p-1">{con.column_name}</td>
                                    <td className="p-1">
                                      {con.foreign_table_name}.{con.foreign_column_name}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <p>This utility will:</p>
          <ul className="list-disc pl-5">
            <li>Add the provider_id column to profiles table if it doesn't exist</li>
            <li>Fix foreign key constraints between profiles, services, and bookings</li>
            <li>Create or update the provider_clients relationship table</li>
            <li>Ensure conversations properly track participants</li>
            <li>Add performance indexes for faster queries</li>
          </ul>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Make sure your database is properly set up before running this utility. If you haven't set up your
              database yet, please run the database setup process first.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={fixRelationships} disabled={loading || !tablesExist || checkingTables}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fixing Relationships...
            </>
          ) : checkingTables ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking Database...
            </>
          ) : (
            "Fix Database Relationships"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
