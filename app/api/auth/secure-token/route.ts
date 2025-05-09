import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // This is a server-side function, so it's safe to access non-public env vars
  const token = process.env.TOKEN || ""

  if (!token) {
    return NextResponse.json({ error: "Token not configured on server" }, { status: 500 })
  }

  // Generate a temporary token or use other secure methods
  // This is just an example - in production, use proper token generation
  const tempToken = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

  return NextResponse.json({ tempToken })
}
