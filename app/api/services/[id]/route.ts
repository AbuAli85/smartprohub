import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the URL and key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const id = params.id

    const { data, error } = await supabase.from("services").select("*").eq("id", id).single()

    if (error) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const id = params.id
    const data = await request.json()

    const { error } = await supabase
      .from("services")
      .update({
        name: data.name,
        description: data.description || null,
        price: data.price,
        duration: data.duration,
        category: data.category || null,
        is_active: data.isActive !== undefined ? data.isActive : true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const id = params.id

    const { error } = await supabase.from("services").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
