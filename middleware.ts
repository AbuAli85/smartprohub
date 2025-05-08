import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Get the current URL and path
  const url = req.nextUrl
  const path = url.pathname

  // Skip middleware for static assets, API routes, debug pages, and auth pages
  if (
    path.startsWith("/_next/") ||
    path.startsWith("/api/") ||
    path.startsWith("/favicon.ico") ||
    path.includes(".") || // Skip files with extensions
    path.startsWith("/auth/") || // Skip all auth routes
    url.searchParams.has("debug") // Skip if debug parameter is present
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
    if (!session && isProtectedRoute(path)) {
      return NextResponse.redirect(new URL(`/auth/debug?from=${encodeURIComponent(path)}`, req.url))
    }

    // If user is logged in and accessing the root path, redirect to dashboard
    if (session && path === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
  } catch (e) {
    console.error("Middleware error:", e)

    // If there's an error, redirect to the debug page
    if (isProtectedRoute(path)) {
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

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/"],
}
