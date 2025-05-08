import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  const results = {
    database: {
      neon: { status: "unknown", message: "" },
      supabase: { status: "unknown", message: "" },
    },
    auth: {
      status: "unknown",
      user: null,
      role: null,
      message: "",
    },
    environment: {
      variables: {
        postgres_url: process.env.POSTGRES_URL ? "configured" : "missing",
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "missing",
        supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "configured" : "missing",
      },
    },
    timestamp: new Date().toISOString(),
  }

  // Check Neon database connection
  try {
    if (!process.env.POSTGRES_URL) {
      results.database.neon = {
        status: "error",
        message: "POSTGRES_URL environment variable is not configured",
      }
    } else {
      const sql = neon(process.env.POSTGRES_URL)
      const startTime = Date.now()
      const result = await sql`SELECT 1 as connection_test`
      const endTime = Date.now()

      if (result && result[0]?.connection_test === 1) {
        results.database.neon = {
          status: "connected",
          message: `Connection successful (${endTime - startTime}ms)`,
        }
      } else {
        results.database.neon = {
          status: "error",
          message: "Connection test failed",
        }
      }
    }
  } catch (error: any) {
    results.database.neon = {
      status: "error",
      message: `Connection error: ${error.message}`,
    }
  }

  // Check Supabase connection and auth
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      results.database.supabase = {
        status: "error",
        message: "Supabase environment variables are not configured",
      }
    } else {
      const supabase = createServerComponentClient({ cookies })

      // Test database connection
      const { data: dbTest, error: dbError } = await supabase
        .from("profiles")
        .select("count", { count: "exact", head: true })

      if (dbError) {
        results.database.supabase = {
          status: "error",
          message: `Database error: ${dbError.message}`,
        }
      } else {
        results.database.supabase = {
          status: "connected",
          message: `Connection successful (${dbTest?.count || 0} profiles found)`,
        }
      }

      // Check authentication
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession()

      if (authError) {
        results.auth = {
          status: "error",
          user: null,
          role: null,
          message: `Auth error: ${authError.message}`,
        }
      } else if (!session) {
        results.auth = {
          status: "unauthenticated",
          user: null,
          role: null,
          message: "No active session found",
        }
      } else {
        // Get user profile to determine role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", session.user.id)
          .single()

        if (profileError) {
          results.auth = {
            status: "authenticated",
            user: session.user.email,
            role: "unknown",
            message: `Profile error: ${profileError.message}`,
          }
        } else {
          results.auth = {
            status: "authenticated",
            user: session.user.email,
            role: profile?.role || "unknown",
            message: `Authenticated as ${profile?.full_name || session.user.email} (${profile?.role || "unknown role"})`,
          }
        }
      }
    }
  } catch (error: any) {
    results.database.supabase = {
      status: "error",
      message: `Supabase error: ${error.message}`,
    }
  }

  return NextResponse.json(results)
}
