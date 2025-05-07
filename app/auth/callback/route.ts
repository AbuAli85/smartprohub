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
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      await supabase.auth.exchangeCodeForSession(code)

      // Get the user to determine where to redirect
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Get the user's role from the profile
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        // Determine redirect based on role
        if (profile?.role) {
          switch (profile.role) {
            case "admin":
              return NextResponse.redirect(new URL("/admin/dashboard", request.url))
            case "provider":
              return NextResponse.redirect(new URL("/provider/dashboard", request.url))
            case "client":
              return NextResponse.redirect(new URL("/client/dashboard", request.url))
          }
        }
      }
    } catch (err) {
      console.error("Error exchanging code for session:", err)
      const redirectUrl = new URL("/auth/login", request.url)
      redirectUrl.searchParams.set("error", "Failed to complete authentication")
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Default URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/dashboard", request.url))
}
