import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Simple middleware that doesn't use any App Router specific features
  return NextResponse.next()
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Add paths that need middleware here
    // Example: '/dashboard/:path*'
  ],
}
