"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ReloadIcon, CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons"

interface TableStatus {
  name: string
  exists: boolean
  rowCount?: number
  error?: string
}

export function DatabaseCheck() {
  const [tables, setTables] = useState<TableStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkTables = async () => {
    setLoading(true)
    setError(null)

    try {
      // List of essential tables to check
      const tablesToCheck = ["profiles", "services", "bookings", "contracts", "messages"]
      const tableResults: TableStatus[] = []

      for (const tableName of tablesToCheck) {
        try {
          // Check if table exists by trying to count rows
          const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true })

          if (error) {
            tableResults.push({
              name: tableName,
              exists: false,
              error: error.message,
            })
          } else {
            tableResults.push({
              name: tableName,
              exists: true,
              rowCount: count || 0,
            })
          }
        } catch (tableError) {
          tableResults.push({
            name: tableName,
            exists: false,
            error: tableError instanceof Error ? tableError.message : "Unknown error",
          })
        }
      }

      setTables(tableResults)
    } catch (err) {
      setError("Failed to check database tables")
      console.error("Database check error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkTables()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Tables Check</CardTitle>
        <CardDescription>Verify that essential database tables are set up correctly</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            <span>Checking database tables...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {tables.map((table) => (
              <div key={table.name} className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">{table.name}</h3>
                  {table.exists ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircledIcon className="mr-1 h-5 w-5" />
                      <span>Available</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <CrossCircledIcon className="mr-1 h-5 w-5" />
                      <span>Missing</span>
                    </div>
                  )}
                </div>

                {table.exists ? (
                  <p className="text-sm text-gray-600">
                    Table has {table.rowCount} {table.rowCount === 1 ? "row" : "rows"}
                  </p>
                ) : (
                  <p className="text-sm text-red-600">{table.error || "Table does not exist"}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkTables} disabled={loading}>
          {loading ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Refresh Check"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
