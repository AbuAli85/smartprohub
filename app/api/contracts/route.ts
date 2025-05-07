import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.content || !data.userId || !data.startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert into contracts table
    const { data: contract, error } = await supabase
      .from("contracts")
      .insert({
        user_id: data.userId,
        title: data.title,
        content: data.content,
        status: "draft",
        start_date: data.startDate,
        end_date: data.endDate || null,
        value: data.value || null,
        document_url: data.documentUrl || null,
        document_name: data.documentName || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating contract:", error)
      return NextResponse.json({ error: "Failed to create contract" }, { status: 500 })
    }

    // If there's analysis data, store it in a separate table
    if (data.analysis) {
      const { error: analysisError } = await supabase.from("contract_analyses").insert({
        contract_id: contract.id,
        summary: data.analysis.summary,
        risks: data.analysis.risks,
        recommendations: data.analysis.recommendations,
        score: data.analysis.score,
        created_at: new Date().toISOString(),
      })

      if (analysisError) {
        console.error("Error storing contract analysis:", analysisError)
        // Continue anyway since the contract was created
      }
    }

    return NextResponse.json(contract)
  } catch (error) {
    console.error("Error in contract creation:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    let query = supabase.from("contracts").select("*").order("created_at", { ascending: false })

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching contracts:", error)
      return NextResponse.json({ error: "Failed to fetch contracts" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET contracts:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
