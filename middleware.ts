import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This is a simplified middleware that only handles basic auth redirects
export async function middleware(req: NextRequest) {
  // Get the current URL and path
  const url = req.nextUrl
  const path = url.pathname

  // Skip middleware for static assets, API routes, and debug pages
  if (
    path.startsWith("/_next/") ||
    path.startsWith("/api/") ||
    path.startsWith("/favicon.ico") ||
    path.includes(".") || // Skip files with extensions
    path === "/auth/debug" || // Skip the debug page
    url.searchParams.has("debug") // Skip if debug parameter is present
  ) {
    return NextResponse.next()
  }

  // Create a response to modify
  const res = NextResponse.next()

  // Create Supabase client
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Get the user - more secure than getSession
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // Log session status for debugging
    console.log(`Middleware: Path=${path}, HasUser=${!!user}, Error=${error?.message || "none"}`)

    // Very simple logic: if user is not logged in and tries to access a protected route, redirect to login
    if (!user && isProtectedRoute(path)) {
      console.log(`Redirecting to login: No valid user for protected route ${path}`)
      return NextResponse.redirect(new URL(`/auth/login?redirectedFrom=${encodeURIComponent(path)}`, req.url))
    }

    // If user is logged in and tries to access login page, redirect to dashboard
    if (user && isAuthRoute(path)) {
      console.log(`Redirecting from auth route: User already authenticated`)
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
  } catch (e) {
    console.error("Middleware error:", e)
    return res
  }
}

// Helper function to check if a route is protected
function isProtectedRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/provider") ||
    pathname.startsWith("/client")
  )
}

// Helper function to check if a route is an auth route
function isAuthRoute(pathname: string): boolean {
  return pathname === "/auth/login" || pathname === "/auth/register"
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/"],
}
