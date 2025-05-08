import { NextResponse } from "next/server"
import { sql } from "@/lib/neon/client"

export async function POST() {
  try {
    // Check which tables exist first
    const tableCheck = await sql.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('profiles', 'services', 'provider_services');
    `)

    const existingTables = tableCheck.map((row: any) => row.table_name)

    // Insert sample data only into tables that exist
    if (existingTables.includes("profiles")) {
      await sql.query(`
        INSERT INTO profiles (id, email, full_name, role, avatar_url)
        VALUES 
          ('00000000-0000-0000-0000-000000000001', 'admin@smartpro.com', 'Admin User', 'admin', '/letter-a-abstract.png'),
          ('00000000-0000-0000-0000-000000000002', 'provider@smartpro.com', 'Provider User', 'provider', '/letter-p-typography.png'),
          ('00000000-0000-0000-0000-000000000003', 'client@smartpro.com', 'Client User', 'client', '/letter-c-typography.png')
        ON CONFLICT (id) DO NOTHING;
      `)
    }

    if (existingTables.includes("services")) {
      await sql.query(`
        INSERT INTO services (id, name, description, price, duration, category)
        VALUES
          (uuid_generate_v4(), 'Business Consultation', 'One-on-one business consultation session', 150, 60, 'Consultation'),
          (uuid_generate_v4(), 'Financial Planning', 'Comprehensive financial planning session', 200, 90, 'Financial'),
          (uuid_generate_v4(), 'Marketing Strategy', 'Marketing strategy development session', 250, 120, 'Marketing')
        ON CONFLICT DO NOTHING;
      `)
    }

    // Get profile IDs if profiles table exists
    let adminId, providerId, clientId
    if (existingTables.includes("profiles")) {
      const profiles = await sql.query(`
        SELECT id, email, role FROM profiles 
        WHERE email IN ('admin@smartpro.com', 'provider@smartpro.com', 'client@smartpro.com');
      `)

      adminId = profiles.find((u: any) => u.role === "admin")?.id
      providerId = profiles.find((u: any) => u.role === "provider")?.id
      clientId = profiles.find((u: any) => u.role === "client")?.id
    }

    // Insert provider services if provider exists and table exists
    if (providerId && existingTables.includes("provider_services")) {
      await sql.query(`
        INSERT INTO provider_services (id, provider_id, name, description, duration, price, category, is_active)
        VALUES 
          (uuid_generate_v4(), '${providerId}', 'Business Consultation', 'One-on-one business consultation session', 60, 150.00, 'Consultation', true),
          (uuid_generate_v4(), '${providerId}', 'Financial Planning', 'Comprehensive financial planning session', 90, 200.00, 'Financial', true),
          (uuid_generate_v4(), '${providerId}', 'Marketing Strategy', 'Marketing strategy development session', 120, 250.00, 'Marketing', true)
        ON CONFLICT DO NOTHING;
      `)
    }

    return NextResponse.json({
      status: "success",
      message: "Database seeded successfully",
      timestamp: new Date().toISOString(),
      details: {
        tablesSeeded: existingTables,
        adminId,
        providerId,
        clientId,
      },
    })
  } catch (error: any) {
    console.error("Error seeding database:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to seed database",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
