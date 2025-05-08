import { NextResponse } from "next/server"
import { sql } from "@/lib/neon/client"

export async function POST() {
  try {
    // Insert sample users
    await sql.query(`
      INSERT INTO users (email, name, role)
      VALUES 
        ('admin@smartpro.com', 'Admin User', 'admin'),
        ('provider@smartpro.com', 'Provider User', 'provider'),
        ('client@smartpro.com', 'Client User', 'client')
      ON CONFLICT (email) DO NOTHING;
    `)

    // Get user IDs
    const users = await sql.query(`
      SELECT id, email, role FROM users 
      WHERE email IN ('admin@smartpro.com', 'provider@smartpro.com', 'client@smartpro.com');
    `)

    const adminId = users.rows.find((u: any) => u.role === "admin")?.id
    const providerId = users.rows.find((u: any) => u.role === "provider")?.id
    const clientId = users.rows.find((u: any) => u.role === "client")?.id

    // Insert provider profile
    if (providerId) {
      await sql.query(
        `
        INSERT INTO provider_profiles (user_id, business_name, description, expertise, years_experience, hourly_rate)
        VALUES ($1, 'SmartPRO Services', 'Professional business services provider', ARRAY['Consulting', 'Marketing', 'Finance'], 5, 150.00)
        ON CONFLICT (user_id) DO NOTHING;
      `,
        [providerId],
      )
    }

    // Insert client profile
    if (clientId) {
      await sql.query(
        `
        INSERT INTO client_profiles (user_id, company_name, industry)
        VALUES ($1, 'Client Corp', 'Technology')
        ON CONFLICT (user_id) DO NOTHING;
      `,
        [clientId],
      )
    }

    // Get provider profile ID
    const providerProfiles = await sql.query(
      `
      SELECT id FROM provider_profiles WHERE user_id = $1;
    `,
      [providerId],
    )

    const providerProfileId = providerProfiles.rows[0]?.id

    // Insert services
    if (providerProfileId) {
      await sql.query(
        `
        INSERT INTO provider_services (provider_id, name, description, duration, price)
        VALUES 
          ($1, 'Business Consultation', 'One-on-one business consultation session', 60, 150.00),
          ($1, 'Financial Planning', 'Comprehensive financial planning session', 90, 200.00),
          ($1, 'Marketing Strategy', 'Marketing strategy development session', 120, 250.00)
        ON CONFLICT DO NOTHING;
      `,
        [providerProfileId],
      )
    }

    // Get client profile ID
    const clientProfiles = await sql.query(
      `
      SELECT id FROM client_profiles WHERE user_id = $1;
    `,
      [clientId],
    )

    const clientProfileId = clientProfiles.rows[0]?.id

    // Insert sample booking
    if (clientProfileId && providerProfileId) {
      const services = await sql.query(
        `
        SELECT id FROM provider_services WHERE provider_id = $1 LIMIT 1;
      `,
        [providerProfileId],
      )

      const serviceId = services.rows[0]?.id

      if (serviceId) {
        await sql.query(
          `
          INSERT INTO bookings (client_id, service_id, provider_id, start_time, end_time, status)
          VALUES ($1, $2, $3, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 1 hour', 'pending')
          ON CONFLICT DO NOTHING;
        `,
          [clientProfileId, serviceId, providerProfileId],
        )
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Database seeded successfully",
      timestamp: new Date().toISOString(),
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
