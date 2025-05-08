import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST() {
  try {
    // Connect to the database
    const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || "")

    // First, get some provider and client IDs from the profiles table
    const profiles = await sql`
      SELECT id, role FROM profiles LIMIT 10
    `

    if (profiles.length < 2) {
      return NextResponse.json(
        { error: "Not enough profiles in the database to create sample bookings" },
        { status: 400 },
      )
    }

    // Find provider and client profiles
    const providers = profiles.filter((p) => p.role === "provider" || p.role === "admin")
    const clients = profiles.filter((p) => p.role === "client" || p.role === null)

    // If we don't have both types, just use the first two profiles
    const providerId = providers.length > 0 ? providers[0].id : profiles[0].id
    const clientId = clients.length > 0 ? clients[0].id : profiles[1].id

    // Get a service ID
    const services = await sql`
      SELECT id, name, price FROM services LIMIT 5
    `

    if (services.length === 0) {
      return NextResponse.json({ error: "No services found in the database" }, { status: 400 })
    }

    const service = services[0]

    // Create sample bookings
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)

    // Format dates for SQL
    const tomorrowFormatted = tomorrow.toISOString().split("T")[0]
    const nextWeekFormatted = nextWeek.toISOString().split("T")[0]

    // Insert sample bookings
    await sql`
      INSERT INTO bookings (
        provider_id, client_id, service_id, booking_date, start_time, end_time, 
        status, service_name, service_fee, location, notes
      ) VALUES 
      (
        ${providerId}, ${clientId}, ${service.id}, ${tomorrowFormatted}, '09:00:00', '10:00:00', 
        'confirmed', ${service.name}, ${service.price}, 'Office', 'Initial consultation'
      ),
      (
        ${providerId}, ${clientId}, ${service.id}, ${nextWeekFormatted}, '14:00:00', '15:00:00', 
        'pending', ${service.name}, ${service.price}, 'Virtual', 'Follow-up meeting'
      )
    `

    // Check how many bookings were created
    const bookingsCount = await sql`
      SELECT COUNT(*) FROM bookings
    `

    return NextResponse.json({
      success: true,
      message: "Sample bookings created successfully",
      count: bookingsCount[0].count,
    })
  } catch (error: any) {
    console.error("Error seeding bookings:", error)
    return NextResponse.json({ error: error.message || "Failed to seed bookings" }, { status: 500 })
  }
}
