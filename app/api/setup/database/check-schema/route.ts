import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    // Connect to the database
    const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || "")

    // Check tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    // Check foreign keys for bookings table
    const bookingsForeignKeys = await sql`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'bookings'
    `

    // Check columns for bookings table
    let bookingsColumns = []
    try {
      bookingsColumns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'bookings'
        ORDER BY ordinal_position
      `
    } catch (error) {
      console.error("Error getting bookings columns:", error)
    }

    // Check columns for services table
    let servicesColumns = []
    try {
      servicesColumns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'services'
        ORDER BY ordinal_position
      `
    } catch (error) {
      console.error("Error getting services columns:", error)
    }

    // Check for existing services
    let services = []
    try {
      services = await sql`
        SELECT id, name, provider_id
        FROM services
        LIMIT 10
      `
    } catch (error) {
      console.error("Error getting services:", error)
    }

    // Check for existing profiles
    let profiles = []
    try {
      profiles = await sql`
        SELECT id, role
        FROM profiles
        LIMIT 10
      `
    } catch (error) {
      console.error("Error getting profiles:", error)
    }

    return NextResponse.json({
      success: true,
      tables: tables.map((t) => t.table_name),
      bookingsForeignKeys,
      bookingsColumns,
      servicesColumns,
      services,
      profiles,
    })
  } catch (error: any) {
    console.error("Error checking schema:", error)
    return NextResponse.json(
      {
        error: `Error checking schema: ${error.message || "Unknown error"}`,
        details: error.toString(),
      },
      { status: 500 },
    )
  }
}
