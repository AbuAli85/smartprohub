import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase.from("contracts").select("*").order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    return handleApiError(error, "GET contracts")
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase.from("contracts").insert(body).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    return handleApiError(error, "POST contract")
  }
}
