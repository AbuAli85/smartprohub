import { type NextRequest, NextResponse } from "next/server"
import { applyCorsHeaders, handleCorsOptions } from "@/lib/cors"

export async function GET(request: NextRequest) {
  // Create the response
  const response = NextResponse.json({
    status: "success",
    message: "Authentication API is working correctly",
    timestamp: new Date().toISOString(),
  })

  // Apply CORS headers
  return applyCorsHeaders(request, response)
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions()
}
