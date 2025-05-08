import { type NextRequest, NextResponse } from "next/server"

// Define allowed origins
const allowedOrigins = [
  "https://smartpro-business-hub.vercel.app",
  "https://smartpro-business-hub-git-main.vercel.app",
  "http://localhost:3000",
]

/**
 * Apply CORS headers to a response
 * @param request The incoming request
 * @param response The response to modify
 * @returns The modified response with CORS headers
 */
export function applyCorsHeaders(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get("origin")

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
  } else {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigins[0])
  }

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token")
  response.headers.set("Access-Control-Allow-Credentials", "true")

  return response
}

/**
 * Handle OPTIONS requests for CORS preflight
 * @returns A response for OPTIONS requests
 */
export function handleCorsOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
      "Access-Control-Max-Age": "86400",
    },
  })
}
