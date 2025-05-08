import { NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Create a server-side Supabase client
    const supabase = createServerComponentClient({ cookies })

    // Simple query to test connection
    const { data, error } = await supabase.from("profiles").select("count", { count: "exact", head: true })

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Supabase connection failed",
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "success",
      message: "Supabase connection successful",
      count: data?.count || 0,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Supabase test failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
