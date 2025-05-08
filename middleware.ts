import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
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
    pathname === "/auth-test" ||
    pathname.includes("callback") ||
    pathname.includes("reset-password") ||
    pathname.includes("sign-in") ||
    pathname.includes("sign-up")
  )
}

export async function middleware(req: NextRequest) {
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

    // Handle actual request
    const response = NextResponse.next()

    // Add CORS headers to the response
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin)
    } else {
      response.headers.set("Access-Control-Allow-Origin", allowedOrigins[0])
    }

    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.set("Access-Control-Allow-Credentials", "true")

    return response
  }

  // Skip middleware for static assets, API routes, and auth routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".") || // Skip files with extensions
    isAuthRoute(pathname) || // Skip all auth routes
    req.nextUrl.searchParams.has("debug") // Skip if debug parameter is present
  ) {
    return NextResponse.next()
  }

  // Create a response to modify
  const res = NextResponse.next()

  try {
    // Create Supabase client
    const supabase = createMiddlewareClient({ req, res })

    // Get the user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is not logged in and tries to access a protected route, redirect to debug page
    if (!session && isProtectedRoute(pathname)) {
      return NextResponse.redirect(new URL(`/auth/debug?from=${encodeURIComponent(pathname)}`, req.url))
    }

    // If user is logged in and accessing the root path, redirect to dashboard
    if (session && pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
  } catch (e) {
    console.error("Middleware error:", e)

    // If there's an error, redirect to the debug page
    if (isProtectedRoute(pathname)) {
      return NextResponse.redirect(new URL(`/auth/debug?error=middleware_error`, req.url))
    }

    return res
  }
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

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Apply to all API routes
    "/api/:path*",
    // Apply to all routes except static assets and specific excluded paths
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
