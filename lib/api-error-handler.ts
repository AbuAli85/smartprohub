import { NextResponse } from "next/server"
import { logError } from "./error-handler"

export type ApiErrorResponse = {
  error: string
  details?: unknown
  status: number
}

export function handleApiError(error: unknown, context: string): NextResponse<ApiErrorResponse> {
  // Log the error
  logError(error, `API - ${context}`)

  // Determine the error message and status code
  let message = "An unexpected error occurred"
  let status = 500
  let details: unknown = undefined

  if (error instanceof Error) {
    message = error.message

    // Extract additional details if available
    if ("details" in error && error.details) {
      details = error.details
    }

    // Handle specific error types
    if (message.includes("not found") || message.includes("does not exist")) {
      status = 404
    } else if (message.includes("unauthorized") || message.includes("not authorized")) {
      status = 401
    } else if (message.includes("forbidden")) {
      status = 403
    } else if (message.includes("validation") || message.includes("invalid")) {
      status = 400
    }
  }

  // Return a structured error response
  return NextResponse.json(
    {
      error: message,
      details,
      status,
    },
    { status },
  )
}
