import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import fs from "fs"
import path from "path"

export async function POST() {
  try {
    // Connect to the database
    const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || "")

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "database-fix-bookings-table-revised.sql")
    let sqlContent

    try {
      sqlContent = fs.readFileSync(sqlFilePath, "utf8")
    } catch (error) {
      // If file doesn't exist, use the hardcoded SQL
      sqlContent = `
-- Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  service_name VARCHAR(255) NOT NULL,
  service_fee DECIMAL(10, 2) NOT NULL,
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS bookings_provider_id_idx ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS bookings_client_id_idx ON bookings(client_id);
CREATE INDEX IF NOT EXISTS bookings_service_id_idx ON bookings(service_id);
CREATE INDEX IF NOT EXISTS bookings_date_idx ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
      `
    }

    // Execute each SQL statement separately
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0)
      .map((stmt) => stmt + ";")

    const results = []

    for (const statement of statements) {
      try {
        await sql.query(statement)
        results.push({
          success: true,
          statement: statement.length > 50 ? statement.substring(0, 50) + "..." : statement,
        })
      } catch (error: any) {
        console.error(`Error executing statement: ${statement}`, error)
        results.push({
          success: false,
          statement: statement.length > 50 ? statement.substring(0, 50) + "..." : statement,
          error: error.message,
        })
      }
    }

    // Check if bookings table was created successfully
    const tablesCheck = await sql`
      SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') as bookings_exists
    `

    return NextResponse.json({
      success: true,
      message: "Bookings table created successfully",
      tablesCheck: tablesCheck[0],
      results,
    })
  } catch (error: any) {
    console.error("Error creating bookings table:", error)
    return NextResponse.json({ error: error.message || "Failed to create bookings table" }, { status: 500 })
  }
}
