import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null

    if (!token) {
      return NextResponse.json(
        {
          status: "unauthenticated",
          message: "No token provided",
        },
        { status: 401 },
      )
    }

    // Create a direct Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify the token
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return NextResponse.json(
        {
          status: "unauthenticated",
          message: "Invalid token",
          error: error?.message,
        },
        { status: 401 },
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name, email")
      .eq("id", data.user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching profile:", profileError)
    }

    return NextResponse.json({
      status: "authenticated",
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role || null,
        name: profile?.full_name || null,
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
