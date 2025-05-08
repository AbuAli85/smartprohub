import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define allowed origins based on environment
const allowedOrigins = [
  "https://smartpro-business-hub.vercel.app",
  "https://smartpro-business-hub-git-main.vercel.app",
  "http://localhost:3000",
]

// Helper function to check if the request is for an API route
function isApiRoute(pathname: string) {
  return pathname.startsWith("/api/")
}

// Helper function to check if a route is an auth route that should be excluded from middleware
function isAuthRoute(pathname: string) {
  return (
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/auth-test" ||
    pathname === "/auth-test-simple" ||
    pathname.includes("callback") ||
    pathname.includes("reset-password") ||
    pathname.includes("sign-in") ||
    pathname.includes("sign-up") ||
    pathname.startsWith("/setup/") ||
    pathname.startsWith("/debug/")
  )
}

// Helper function to check if a route is a public route
function isPublicRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/blog")
  )
}

// Helper function to check if a route is protected
function isProtectedRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/provider") ||
    pathname.startsWith("/client") ||
    pathname === "/profile-setup"
  )
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl
  const origin = req.headers.get("origin")

  // Only apply CORS middleware to API routes
  if (isApiRoute(pathname)) {
    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token, X-Requested-With",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400", // 24 hours
        },
      })
    }

    // Add CORS headers to the response
    if (origin && allowedOrigins.includes(origin)) {
      res.headers.set("Access-Control-Allow-Origin", origin)
    } else {
      res.headers.set("Access-Control-Allow-Origin", allowedOrigins[0])
    }

    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    res.headers.set("Access-Control-Allow-Credentials", "true")

    return res
  }

  // Skip middleware for static assets and other non-page routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".") || // Skip files with extensions
    isAuthRoute(pathname) || // Skip all auth routes
    req.nextUrl.searchParams.has("debug") // Skip if debug parameter is present
  ) {
    return NextResponse.next()
  }

  // For protected routes, we'll handle auth in the components themselves
  // This simplifies the middleware and avoids using Supabase auth helpers
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
