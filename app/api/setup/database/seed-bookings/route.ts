import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST() {
  try {
    // Connect to the database
    const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || "")

    // First, check if the bookings table exists
    const bookingsTableExists = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'bookings'
      ) as exists
    `

    if (!bookingsTableExists[0].exists) {
      return NextResponse.json(
        {
          error: "Bookings table does not exist. Please create it first.",
          step: "check-bookings-table",
        },
        { status: 400 },
      )
    }

    // Check if services table exists
    const servicesTableExists = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'services'
      ) as exists
    `

    if (!servicesTableExists[0].exists) {
      return NextResponse.json(
        {
          error: "Services table does not exist. Please create it first.",
          step: "check-services-table",
        },
        { status: 400 },
      )
    }

    // Check if profiles table exists
    const profilesTableExists = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles'
      ) as exists
    `

    if (!profilesTableExists[0].exists) {
      return NextResponse.json(
        {
          error: "Profiles table does not exist. Please create it first.",
          step: "check-profiles-table",
        },
        { status: 400 },
      )
    }

    // Get all existing profiles
    const profiles = await sql`
      SELECT id, role FROM profiles
    `

    if (profiles.length === 0) {
      return NextResponse.json(
        {
          error: "No profiles found in the database. Please create profiles first.",
          step: "check-profiles",
        },
        { status: 400 },
      )
    }

    console.log(`Found ${profiles.length} profiles`)

    // Find a provider profile
    const providerProfile = profiles.find((p) => p.role === "provider" || p.role === "admin")

    // If no provider profile exists, create one
    let providerId
    if (!providerProfile) {
      console.log("No provider profiles found. Creating a sample provider profile...")

      const newProvider = await sql`
        INSERT INTO profiles (
          user_id, 
          full_name, 
          email, 
          role,
          created_at,
          updated_at
        )
        VALUES (
          uuid_generate_v4(), 
          'Sample Provider', 
          'provider@example.com', 
          'provider',
          NOW(),
          NOW()
        )
        RETURNING id
      `

      if (newProvider.length === 0) {
        return NextResponse.json(
          {
            error: "Failed to create a sample provider profile.",
            step: "create-provider",
          },
          { status: 500 },
        )
      }

      providerId = newProvider[0].id
      console.log("Created provider with ID:", providerId)
    } else {
      providerId = providerProfile.id
      console.log("Using existing provider with ID:", providerId)
    }

    // Find a client profile (different from provider)
    const clientProfile = profiles.find((p) => (p.role === "client" || p.role === null) && p.id !== providerId)

    // If no client profile exists, create one
    let clientId
    if (!clientProfile) {
      console.log("No client profiles found. Creating a sample client profile...")

      const newClient = await sql`
        INSERT INTO profiles (
          user_id, 
          full_name, 
          email, 
          role,
          created_at,
          updated_at
        )
        VALUES (
          uuid_generate_v4(), 
          'Sample Client', 
          'client@example.com', 
          'client',
          NOW(),
          NOW()
        )
        RETURNING id
      `

      if (newClient.length === 0) {
        return NextResponse.json(
          {
            error: "Failed to create a sample client profile.",
            step: "create-client",
          },
          { status: 500 },
        )
      }

      clientId = newClient[0].id
      console.log("Created client with ID:", clientId)
    } else {
      clientId = clientProfile.id
      console.log("Using existing client with ID:", clientId)
    }

    // Get all existing services
    const services = await sql`
      SELECT id, name, price, provider_id FROM services
    `

    console.log(`Found ${services.length} services`)

    // Service data to use for bookings
    let serviceId, serviceName, servicePrice

    if (services.length === 0) {
      // Create a sample service
      console.log("No services found. Creating a sample service...")
      console.log("Using provider ID for service:", providerId)

      const newService = await sql`
        INSERT INTO services (
          name, 
          description, 
          price, 
          duration, 
          provider_id,
          created_at,
          updated_at
        )
        VALUES (
          'Business Consultation', 
          'Professional business consultation service', 
          150.00, 
          60,
          ${providerId},
          NOW(),
          NOW()
        )
        RETURNING id, name, price
      `

      if (newService.length === 0) {
        return NextResponse.json(
          {
            error: "Failed to create a sample service.",
            step: "create-service",
          },
          { status: 500 },
        )
      }

      serviceId = newService[0].id
      serviceName = newService[0].name
      servicePrice = newService[0].price
      console.log("Created service with ID:", serviceId)
    } else {
      // Get an existing service
      const service = services[0]
      serviceId = service.id
      serviceName = service.name
      servicePrice = service.price
      console.log("Using existing service with ID:", serviceId)
    }

    // Double-check that the service exists
    const serviceCheck = await sql`
      SELECT id FROM services WHERE id = ${serviceId}
    `

    if (serviceCheck.length === 0) {
      return NextResponse.json(
        {
          error: "Service verification failed. The service ID does not exist in the database.",
          serviceId,
          step: "verify-service",
        },
        { status: 500 },
      )
    }

    console.log("Service verified with ID:", serviceId)

    // Create sample bookings
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)

    // Format dates for SQL
    const tomorrowFormatted = tomorrow.toISOString().split("T")[0]
    const nextWeekFormatted = nextWeek.toISOString().split("T")[0]

    // Log the values being used for debugging
    console.log("Final values for booking creation:")
    console.log("- service_id:", serviceId, "type:", typeof serviceId)
    console.log("- provider_id:", providerId, "type:", typeof providerId)
    console.log("- client_id:", clientId, "type:", typeof clientId)
    console.log("- service_name:", serviceName)
    console.log("- service_price:", servicePrice)

    // Try to create a single booking first as a test
    try {
      const testBooking = await sql`
        INSERT INTO bookings (
          provider_id, 
          client_id, 
          service_id, 
          booking_date, 
          start_time, 
          end_time, 
          status, 
          service_name, 
          service_fee, 
          location, 
          notes,
          created_at,
          updated_at
        ) VALUES (
          ${providerId}, 
          ${clientId}, 
          ${serviceId}, 
          ${tomorrowFormatted}, 
          '09:00:00', 
          '10:00:00', 
          'confirmed', 
          ${serviceName}, 
          ${servicePrice}, 
          'Office', 
          'Initial consultation',
          NOW(),
          NOW()
        )
        RETURNING id
      `

      console.log("Test booking created with ID:", testBooking[0]?.id)
    } catch (error) {
      console.error("Error creating test booking:", error)
      return NextResponse.json(
        {
          error: `Error creating test booking: ${error.message || "Unknown error"}`,
          details: {
            serviceId,
            providerId,
            clientId,
            serviceName,
            servicePrice,
          },
          step: "create-test-booking",
        },
        { status: 500 },
      )
    }

    // Now create the second booking
    try {
      const secondBooking = await sql`
        INSERT INTO bookings (
          provider_id, 
          client_id, 
          service_id, 
          booking_date, 
          start_time, 
          end_time, 
          status, 
          service_name, 
          service_fee, 
          location, 
          notes,
          created_at,
          updated_at
        ) VALUES (
          ${providerId}, 
          ${clientId}, 
          ${serviceId}, 
          ${nextWeekFormatted}, 
          '14:00:00', 
          '15:00:00', 
          'pending', 
          ${serviceName}, 
          ${servicePrice}, 
          'Virtual', 
          'Follow-up meeting',
          NOW(),
          NOW()
        )
        RETURNING id
      `

      console.log("Second booking created with ID:", secondBooking[0]?.id)
    } catch (error) {
      console.error("Error creating second booking:", error)
      // Continue even if second booking fails
    }

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
    return NextResponse.json(
      {
        error: `Error seeding bookings: ${error.message || "Unknown error"}`,
        details: error.toString(),
        step: "general-error",
      },
      { status: 500 },
    )
  }
}
