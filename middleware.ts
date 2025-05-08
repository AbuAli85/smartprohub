import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

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

  // Create a Supabase client configured for the middleware
  const supabase = createMiddlewareClient({ req, res })

  // Refresh the session if it exists
  await supabase.auth.getSession()

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

  try {
    // Get the user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is not logged in and tries to access a protected route, redirect to login page
    if (!session && isProtectedRoute(pathname)) {
      const redirectUrl = new URL(`/auth/login?redirectTo=${encodeURIComponent(pathname)}`, req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is logged in and accessing the root path, redirect to appropriate dashboard
    if (session && (pathname === "/" || pathname === "/dashboard")) {
      try {
        // Check if user has a role, if not redirect to profile setup
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        if (!profile?.role) {
          return NextResponse.redirect(new URL("/profile-setup", req.url))
        }

        // Redirect based on role
        if (profile.role === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url))
        } else if (profile.role === "provider") {
          return NextResponse.redirect(new URL("/provider/dashboard", req.url))
        } else if (profile.role === "client") {
          return NextResponse.redirect(new URL("/client/dashboard", req.url))
        } else {
          // Default fallback if role is not recognized
          return NextResponse.redirect(new URL("/dashboard", req.url))
        }
      } catch (profileError) {
        console.error("Error fetching profile in middleware:", profileError)
        // If we can't get the profile, redirect to the generic dashboard
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Role-based access control
    if (session) {
      try {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        // Check if user is trying to access a role-specific area they don't have access to
        if (profile?.role) {
          if (pathname.startsWith("/admin/") && profile.role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", req.url))
          }

          if (pathname.startsWith("/provider/") && profile.role !== "provider") {
            return NextResponse.redirect(new URL("/dashboard", req.url))
          }

          if (pathname.startsWith("/client/") && profile.role !== "client") {
            return NextResponse.redirect(new URL("/dashboard", req.url))
          }
        }
      } catch (error) {
        console.error("Error checking role in middleware:", error)
      }
    }

    return res
  } catch (e) {
    console.error("Middleware error:", e)

    // If there's an error, allow access to debug routes
    if (isProtectedRoute(pathname) && !pathname.startsWith("/debug/")) {
      return NextResponse.redirect(new URL(`/auth/troubleshoot?error=${encodeURIComponent(String(e))}`, req.url))
    }

    return res
  }
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
