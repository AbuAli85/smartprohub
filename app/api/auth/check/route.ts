import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to get session",
          error: error.message,
        },
        { status: 500 },
      )
    }

    if (!session) {
      return NextResponse.json(
        {
          status: "unauthenticated",
          message: "No active session found",
        },
        { status: 200 },
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name, email")
      .eq("id", session.user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching profile:", profileError)
    }

    return NextResponse.json({
      status: "authenticated",
      user: {
        id: session.user.id,
        email: session.user.email,
        role: profile?.role || null,
        name: profile?.full_name || null,
      },
      session: {
        expires: new Date(session.expires_at! * 1000).toISOString(),
      },
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
