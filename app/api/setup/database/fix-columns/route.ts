import { NextResponse } from "next/server"
import { sql } from "@/lib/neon/client"

export async function POST() {
  try {
    // First, check if the tables exist
    const tablesCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('services', 'bookings', 'profiles', 'contracts');
    `

    const existingTables = tablesCheck.map((row) => row.table_name)
    console.log("Existing tables:", existingTables)

    // If no tables exist, we need to create them first
    if (existingTables.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "No database tables found. Please create tables first before fixing columns.",
          details: {
            missingTables: true,
            suggestion: "Run the 'Create Database Tables' action first",
          },
        },
        { status: 400 },
      )
    }

    // Check which specific tables exist
    const servicesExists = existingTables.includes("services")
    const bookingsExists = existingTables.includes("bookings")
    const profilesExists = existingTables.includes("profiles")

    // Track fixes made
    const fixResults = []

    // Only fix services table if it exists
    if (servicesExists) {
      // Check if provider_id column exists in services table
      const serviceColumnCheck = await sql`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'services' 
          AND column_name = 'provider_id'
        ) as column_exists;
      `

      const serviceColumnExists = serviceColumnCheck[0]?.column_exists || false

      // If the column doesn't exist, add it
      if (!serviceColumnExists) {
        await sql`
          ALTER TABLE services 
          ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
        `
        fixResults.push("Added provider_id to services table")
      }
    }

    // Only fix bookings table if it exists
    if (bookingsExists) {
      // Check if client_id exists in bookings
      const clientIdCheck = await sql`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'bookings' 
          AND column_name = 'client_id'
        ) as column_exists;
      `

      const clientIdExists = clientIdCheck[0]?.column_exists || false

      if (!clientIdExists) {
        await sql`
          ALTER TABLE bookings 
          ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
        `
        fixResults.push("Added client_id to bookings table")
      }

      // Check if provider_id exists in bookings
      const providerIdCheck = await sql`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'bookings' 
          AND column_name = 'provider_id'
        ) as column_exists;
      `

      const providerIdExists = providerIdCheck[0]?.column_exists || false

      if (!providerIdExists) {
        await sql`
          ALTER TABLE bookings 
          ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
        `
        fixResults.push("Added provider_id to bookings table")
      }
    }

    return NextResponse.json({
      status: "success",
      message: fixResults.length > 0 ? "Database columns fixed successfully" : "No column fixes needed",
      details: {
        fixes: fixResults,
        tablesChecked: existingTables,
      },
    })
  } catch (error: any) {
    console.error("Error fixing database columns:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fix database columns",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
