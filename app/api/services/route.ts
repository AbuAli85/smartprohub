import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get("providerId")

    if (!providerId) {
      return NextResponse.json({ error: "Provider ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("provider_services")
      .select("*")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching services:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error in GET services:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.providerId || body.price === undefined || body.duration === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, providerId, price, and duration are required" },
        { status: 400 },
      )
    }

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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error("Error in POST service:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
