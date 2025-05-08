import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // Create a Supabase client using environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the SQL script from the request body
    const { sqlScript } = await request.json()

    if (!sqlScript) {
      return NextResponse.json(
        {
          success: false,
          message: "No SQL script provided",
        },
        { status: 400 },
      )
    }

    // Execute the SQL script
    const { error } = await supabase.rpc("run_sql", { sql: sqlScript })

    if (error) {
      console.error("Error setting up database:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to set up database",
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
    })
  } catch (error: any) {
    console.error("Error in database setup:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to set up database",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
