"use client"

import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface PermissionErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function PermissionError({
  title = "Permission Error",
  message = "You don't have permission to access this data. This may be due to missing database permissions.",
  onRetry,
}: PermissionErrorProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p>{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
