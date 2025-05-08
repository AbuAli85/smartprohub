import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Handle error in the callback
  if (error) {
    console.error("Auth callback error:", error, errorDescription)
    const redirectUrl = new URL("/auth/login", request.url)
    redirectUrl.searchParams.set("error", errorDescription || error)
    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
    try {
      // Create a new cookie store and supabase client for this request
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      // Exchange the code for a session
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

      if (sessionError) {
        console.error("Error exchanging code for session:", sessionError)
        const redirectUrl = new URL("/auth/debug", request.url)
        redirectUrl.searchParams.set("error", "session_exchange_failed")
        return NextResponse.redirect(redirectUrl)
      }

      // Redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } catch (err) {
      console.error("Error in auth callback:", err)
      const redirectUrl = new URL("/auth/debug", request.url)
      redirectUrl.searchParams.set("error", "callback_exception")
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If no code is present, redirect to login
  return NextResponse.redirect(new URL("/auth/login", request.url))
}
