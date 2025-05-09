import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware function that doesn't use any App Router specific features
export function middleware(request: NextRequest) {
  // Simple middleware implementation
  return NextResponse.next()
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Add paths that need middleware here
    // Exclude static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
}
