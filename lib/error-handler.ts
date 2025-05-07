// Global error handler utility

// Log errors to console with additional context
export function logError(error: unknown, context?: string): void {
  if (error instanceof Error) {
    console.error(`Error${context ? ` in ${context}` : ""}: ${error.message}`, error.stack)
  } else {
    console.error(`Unknown error${context ? ` in ${context}` : ""}:`, error)
  }
}

// Safely parse error messages from various error types
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message)
  }

  return "An unknown error occurred"
}

// Add global error handlers if in browser environment
export function setupGlobalErrorHandlers(): void {
  if (typeof window === "undefined") return

  // Handle uncaught exceptions
  window.addEventListener("error", (event) => {
    logError(event.error || new Error(event.message), "Uncaught Exception")
  })

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    logError(event.reason, "Unhandled Promise Rejection")
  })

  // Override console.error to add more context
  const originalConsoleError = console.error
  console.error = (...args) => {
    originalConsoleError(...args)

    // You could send these errors to a monitoring service here
    // if (process.env.NODE_ENV === 'production') {
    //   sendToMonitoringService(args);
    // }
  }
}
