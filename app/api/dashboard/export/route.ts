import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/neon/client"
import { supabase } from "@/lib/supabase/client"

// Helper function to convert data to CSV
function convertToCSV(data: any[]) {
  if (!data || data.length === 0) {
    return ""
  }

  // Get headers
  const headers = Object.keys(data[0])

  // Create CSV header row
  let csv = headers.join(",") + "\n"

  // Add data rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header]

      // Handle different data types
      if (value === null || value === undefined) {
        return ""
      } else if (typeof value === "object") {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      } else {
        return `"${String(value).replace(/"/g, '""')}"`
      }
    })

    csv += values.join(",") + "\n"
  })

  return csv
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const dataType = searchParams.get("type") || "revenue" // revenue, bookings, contracts
  const format = searchParams.get("format") || "csv" // csv or json
  const period = searchParams.get("period") || "month" // week, month, year

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    // Verify authentication
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the user has access to the requested userId data
    const currentUserId = sessionData.session.user.id
    const userRole = sessionData.session.user.user_metadata?.role

    if (userId !== currentUserId && userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get data based on type
    let data: any[] = []
    let filename = ""

    if (dataType === "revenue") {
      // Query for revenue data
      const result = await executeQuery(
        `
        SELECT 
          TO_CHAR(created_at, 'YYYY-MM-DD') as date,
          SUM(value) as revenue
        FROM 
          contracts
        WHERE 
          user_id = $1 
          AND status = 'signed'
          AND created_at >= NOW() - INTERVAL '1 ${period}'
        GROUP BY 
          date
        ORDER BY 
          date
        `,
        [userId],
      )

      data = result.rows
      filename = `revenue-data-${period}-${new Date().toISOString().split("T")[0]}`
    } else if (dataType === "bookings") {
      // Query for bookings data
      const result = await executeQuery(
        `
        SELECT 
          id,
          service_id,
          status,
          TO_CHAR(booking_date, 'YYYY-MM-DD') as date,
          TO_CHAR(created_at, 'YYYY-MM-DD') as created_date,
          notes
        FROM 
          bookings
        WHERE 
          user_id = $1
          AND created_at >= NOW() - INTERVAL '1 ${period}'
        ORDER BY 
          booking_date DESC
        `,
        [userId],
      )

      data = result.rows
      filename = `bookings-data-${period}-${new Date().toISOString().split("T")[0]}`
    } else if (dataType === "contracts") {
      // Query for contracts data
      const result = await executeQuery(
        `
        SELECT 
          id,
          title,
          status,
          value,
          TO_CHAR(created_at, 'YYYY-MM-DD') as created_date,
          TO_CHAR(signed_at, 'YYYY-MM-DD') as signed_date
        FROM 
          contracts
        WHERE 
          user_id = $1
          AND created_at >= NOW() - INTERVAL '1 ${period}'
        ORDER BY 
          created_at DESC
        `,
        [userId],
      )

      data = result.rows
      filename = `contracts-data-${period}-${new Date().toISOString().split("T")[0]}`
    }

    // Return data in requested format
    if (format === "csv") {
      const csv = convertToCSV(data)
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      })
    } else {
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
