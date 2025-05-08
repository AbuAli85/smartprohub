"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Database } from "lucide-react"

export function DatabaseFallbackNotice() {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Database Connection Error</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          No database URL found in environment variables. Your application needs a database connection to function
          properly.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/debug/database-setup")}
            className="flex items-center"
          >
            <Database className="mr-2 h-4 w-4" />
            Test Database Connection
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/debug/env-setup")}
            className="flex items-center"
          >
            <Database className="mr-2 h-4 w-4" />
            Create .env.local File
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
