"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Database, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function DatabaseColumnFix() {
  const router = useRouter()
  const [isFixing, setIsFixing] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    error?: string
    details?: any
  } | null>(null)

  const handleFixColumns = async () => {
    try {
      setIsFixing(true)
      setResult(null)

      const response = await fetch("/api/setup/database/fix-columns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details?.missingTables) {
          setResult({
            success: false,
            message: data.message || "No database tables found. Please create tables first.",
            details: data.details,
          })
          return
        }
        throw new Error(data.error || data.message || "Failed to fix database columns")
      }

      setResult({
        success: true,
        message: data.message || "Database columns fixed successfully",
        details: data.details,
      })
    } catch (error: any) {
      console.error("Error fixing database columns:", error)
      setResult({
        success: false,
        message: "Failed to fix database columns",
        error: error.message,
      })
    } finally {
      setIsFixing(false)
    }
  }

  const handleCreateTables = () => {
    router.push("/setup/database?action=create-tables")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Fix Database Columns
        </CardTitle>
        <CardDescription>Fix missing or incorrect columns in your database tables</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This utility will check for missing columns (like provider_id) in your database tables and add them if needed.
          It will also fix any policies that might be referencing non-existent columns.
        </p>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
            {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>
              {result.message}

              {result.details?.missingTables && (
                <div className="mt-4">
                  <p className="text-sm font-medium">You need to create database tables first</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={handleCreateTables}>
                    Create Database Tables
                  </Button>
                </div>
              )}

              {result.details?.fixes && result.details.fixes.length > 0 && (
                <div className="mt-2 text-xs">
                  <ul className="list-disc pl-5">
                    {result.details.fixes.map((fix: string, index: number) => (
                      <li key={index}>{fix}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.error && <div className="mt-2 text-xs font-mono bg-muted p-2 rounded">{result.error}</div>}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleFixColumns} disabled={isFixing} className="w-full">
          {isFixing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fixing Columns...
            </>
          ) : (
            "Fix Database Columns"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
