import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  // Get cookies from the request
  const cookieHeader = request.headers.get("cookie") || ""

  // Create a response to set cookies on
  const response = NextResponse.redirect(`${origin}/auth-test-simple`)

  if (code) {
    // Create a Supabase client using environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        flowType: "pkce",
      },
    })

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)

    // Get the session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If we have a session, set the auth cookie
    if (session) {
      // The cookie will be set by the browser automatically
      return response
    }
  }

  // Redirect to the home page if there's no code or session
  return response
}
