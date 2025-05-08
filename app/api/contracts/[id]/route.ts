import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Contract ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase.from("contracts").select("*").eq("id", id).single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    return handleApiError(error, "GET contract by ID")
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Contract ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase.from("contracts").update(body).eq("id", id).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    return handleApiError(error, "UPDATE contract")
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Contract ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("contracts").delete().eq("id", id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, "DELETE contract")
  }
}
