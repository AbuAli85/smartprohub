import { NextResponse } from "next/server"
import { generateTemporaryToken } from "@/lib/server-env"

export async function GET() {
  try {
    const { token, expires } = generateTemporaryToken()

    return NextResponse.json({ token, expires })
  } catch (error) {
    console.error("Error generating token:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}
