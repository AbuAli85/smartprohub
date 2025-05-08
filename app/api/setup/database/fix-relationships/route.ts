import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST() {
  try {
    const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || "")

    // First check if any tables exist
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    const tables = tablesResult.map((row) => row.table_name)

    if (tables.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No tables found in database. Please run database setup first.",
          tables: [],
        },
        { status: 400 },
      )
    }

    // Continue with relationship fixes if tables exist
    const results = []
    let schemaInfo = {}

    try {
      // Get profile columns
      const profileColumns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'profiles'
      `

      schemaInfo = {
        tables,
        profileColumns,
      }

      // Check if provider_id column exists in profiles
      const hasProviderIdColumn = profileColumns.some((col) => col.column_name === "provider_id")

      if (!hasProviderIdColumn) {
        // Add provider_id column if it doesn't exist
        await sql`
          ALTER TABLE profiles 
          ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES profiles(id)
        `

        results.push({
          success: true,
          description: "Added provider_id column to profiles table",
        })
      } else {
        results.push({
          success: true,
          description: "provider_id column already exists in profiles table",
        })
      }

      // Get foreign key constraints
      const constraints = await sql`
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
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
      `

      schemaInfo = {
        ...schemaInfo,
        constraints,
      }

      // Create provider_clients table if it doesn't exist
      if (!tables.includes("provider_clients")) {
        await sql`
          CREATE TABLE IF NOT EXISTS provider_clients (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            provider_id UUID NOT NULL REFERENCES profiles(id),
            client_id UUID NOT NULL REFERENCES profiles(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(provider_id, client_id)
          )
        `

        results.push({
          success: true,
          description: "Created provider_clients relationship table",
        })
      } else {
        results.push({
          success: true,
          description: "provider_clients table already exists",
        })
      }

      // Add indexes for better performance
      await sql`
        CREATE INDEX IF NOT EXISTS idx_profiles_provider_id ON profiles(provider_id);
        CREATE INDEX IF NOT EXISTS idx_provider_clients_provider_id ON provider_clients(provider_id);
        CREATE INDEX IF NOT EXISTS idx_provider_clients_client_id ON provider_clients(client_id);
      `

      results.push({
        success: true,
        description: "Created performance indexes",
      })
    } catch (error: any) {
      results.push({
        success: false,
        description: "Error fixing relationships",
        error: error.message,
        errorCode: error.code,
      })
    }

    return NextResponse.json({
      success: results.every((r) => r.success),
      message: results.every((r) => r.success)
        ? "Database relationships fixed successfully"
        : "Some errors occurred while fixing relationships",
      results,
      schemaInfo,
    })
  } catch (error: any) {
    console.error("Error fixing relationships:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fix database relationships",
        error: error.toString(),
      },
      { status: 500 },
    )
  }
}
