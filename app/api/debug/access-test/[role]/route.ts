import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { role: string } }) {
  const role = params.role

  // Create Supabase client
  const supabase = createRouteHandlerClient({ cookies })

  // Get the user's session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, return unauthorized
  if (!session) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 })
  }

  // Get the user's profile to determine their role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    return NextResponse.json({ message: "Error fetching user profile" }, { status: 500 })
  }

  const userRole = profile?.role

  // Check if the requested resource matches the user's role
  let hasAccess = false
  let resourceName = ""

  switch (role) {
    case "admin":
      hasAccess = userRole === "admin"
      resourceName = "Admin Dashboard"
      break
    case "provider":
      hasAccess = userRole === "provider" || userRole === "admin"
      resourceName = "Provider Dashboard"
      break
    case "client":
      hasAccess = userRole === "client" || userRole === "admin"
      resourceName = "Client Dashboard"
      break
    case "provider-services":
      hasAccess = userRole === "provider" || userRole === "admin"
      resourceName = "Provider Services"
      break
    case "admin-users":
      hasAccess = userRole === "admin"
      resourceName = "Admin User Management"
      break
    default:
      return NextResponse.json({ message: "Invalid resource" }, { status: 400 })
  }

  // Return appropriate response based on access
  if (hasAccess) {
    return NextResponse.json({
      message: `Access granted to ${resourceName}`,
      userRole,
      resource: role,
    })
  } else {
    return NextResponse.json(
      {
        message: `Access denied to ${resourceName}. Required role: ${role}, your role: ${userRole}`,
        userRole,
        resource: role,
      },
      { status: 403 },
    )
  }
}
