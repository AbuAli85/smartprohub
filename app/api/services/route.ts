import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Add CORS headers helper
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: Request) {
  try {
    console.log("GET /api/services - Processing request")

    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get("providerId")

    if (!providerId) {
      console.log("GET /api/services - Missing providerId parameter")
      return NextResponse.json(
        { error: "Provider ID is required" },
        {
          status: 400,
          headers: corsHeaders,
        },
      )
    }

    console.log(`GET /api/services - Fetching services for provider: ${providerId}`)

    // Set a timeout for the database query
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Database query timed out")), 15000)
    })

    // Create the database query
    const queryPromise = supabase
      .from("provider_services")
      .select("*")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false })

    // Race the query against the timeout
    const result = await Promise.race([queryPromise, timeoutPromise])

    // If we get here, the query succeeded
    const { data, error } = result as any

    if (error) {
      console.error("Error fetching services:", error)
      return NextResponse.json(
        { error: error.message },
        {
          status: 500,
          headers: corsHeaders,
        },
      )
    }

    console.log(`GET /api/services - Successfully fetched ${data?.length || 0} services`)

    // Add cache control headers for better performance
    const responseHeaders = {
      ...corsHeaders,
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    }

    return NextResponse.json(data, { headers: responseHeaders })
  } catch (error: any) {
    console.error("Error in GET services:", error)
    return NextResponse.json(
      { error: error.message },
      {
        status: 500,
        headers: corsHeaders,
      },
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST /api/services - Processing request")

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.providerId || body.price === undefined || body.duration === undefined) {
      console.log("POST /api/services - Missing required fields")
      return NextResponse.json(
        { error: "Missing required fields: name, providerId, price, and duration are required" },
        {
          status: 400,
          headers: corsHeaders,
        },
      )
    }

    console.log(`POST /api/services - Creating service: ${body.name} for provider: ${body.providerId}`)

    // Create the service
    const { data, error } = await supabase
      .from("provider_services")
      .insert({
        provider_id: body.providerId,
        name: body.name,
        description: body.description || null,
        price: Number.parseFloat(body.price),
        duration: Number.parseInt(body.duration),
        category: body.category || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error creating service:", error)
      return NextResponse.json(
        { error: error.message },
        {
          status: 500,
          headers: corsHeaders,
        },
      )
    }

    console.log(`POST /api/services - Service created successfully with ID: ${data?.[0]?.id}`)

    return NextResponse.json(data[0], { headers: corsHeaders })
  } catch (error: any) {
    console.error("Error in POST service:", error)
    return NextResponse.json(
      { error: error.message },
      {
        status: 500,
        headers: corsHeaders,
      },
    )
  }
}
