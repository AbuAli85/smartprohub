import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get the contract
    const { data: contract, error } = await supabase.from("contracts").select("*").eq("id", id).single()

    if (error) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 })
    }

    // Get the analysis if it exists
    const { data: analysis } = await supabase.from("contract_analyses").select("*").eq("contract_id", id).single()

    return NextResponse.json({
      ...contract,
      analysis: analysis || null,
    })
  } catch (error) {
    console.error("Error fetching contract:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()

    const { error } = await supabase
      .from("contracts")
      .update({
        title: data.title,
        content: data.content,
        status: data.status,
        start_date: data.startDate,
        end_date: data.endDate || null,
        value: data.value || null,
        document_url: data.documentUrl || null,
        document_name: data.documentName || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to update contract" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating contract:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const { error } = await supabase.from("contracts").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to delete contract" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting contract:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
