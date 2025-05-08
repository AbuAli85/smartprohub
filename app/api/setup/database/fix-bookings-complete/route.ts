import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST() {
  try {
    // Connect to the database
    const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || "")

    // Get database schema information for services table
    const servicesTable = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'services'
      ORDER BY ordinal_position
    `

    console.log("Services table structure:", servicesTable)

    // Check if updated_at column exists in services table
    const hasUpdatedAt = servicesTable.some((col) => col.column_name === "updated_at")

    // Check if category column exists and is required
    const categoryColumn = servicesTable.find((col) => col.column_name === "category")
    const needsCategory = categoryColumn && categoryColumn.is_nullable === "NO"

    // Get all required columns
    const requiredColumns = servicesTable
      .filter((col) => col.is_nullable === "NO" && col.column_name !== "id")
      .map((col) => col.column_name)

    console.log("Required columns in services table:", requiredColumns)

    // Drop and recreate the bookings table
    await sql`DROP TABLE IF EXISTS bookings`

    await sql`
      CREATE TABLE bookings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        provider_id UUID NOT NULL,
        client_id UUID NOT NULL,
        service_id UUID,
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
      )
    `

    // Add foreign key constraints
    await sql`
      ALTER TABLE bookings 
      ADD CONSTRAINT bookings_provider_id_fkey 
      FOREIGN KEY (provider_id) REFERENCES profiles(id) ON DELETE CASCADE
    `

    await sql`
      ALTER TABLE bookings 
      ADD CONSTRAINT bookings_client_id_fkey 
      FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE
    `

    await sql`
      ALTER TABLE bookings 
      ADD CONSTRAINT bookings_service_id_fkey 
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
    `

    // Create indexes
    await sql`CREATE INDEX bookings_provider_id_idx ON bookings(provider_id)`
    await sql`CREATE INDEX bookings_client_id_idx ON bookings(client_id)`
    await sql`CREATE INDEX bookings_service_id_idx ON bookings(service_id)`
    await sql`CREATE INDEX bookings_date_idx ON bookings(booking_date)`
    await sql`CREATE INDEX bookings_status_idx ON bookings(status)`

    // Enable RLS
    await sql`ALTER TABLE bookings ENABLE ROW LEVEL SECURITY`

    // Get or create profiles
    const profiles = await sql`SELECT id, role FROM profiles`

    if (profiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Bookings table created successfully, but no profiles found to create sample data.",
        bookingsCreated: false,
      })
    }

    // Find or create provider
    let providerId
    const providerProfile = profiles.find((p) => p.role === "provider" || p.role === "admin")

    if (providerProfile) {
      providerId = providerProfile.id
    } else {
      const newProvider = await sql`
        INSERT INTO profiles (
          user_id, full_name, email, role, created_at, updated_at
        ) VALUES (
          uuid_generate_v4(), 'Sample Provider', 'provider@example.com', 'provider', NOW(), NOW()
        ) RETURNING id
      `
      providerId = newProvider[0].id
    }

    // Find or create client
    let clientId
    const clientProfile = profiles.find((p) => (p.role === "client" || p.role === null) && p.id !== providerId)

    if (clientProfile) {
      clientId = clientProfile.id
    } else {
      const newClient = await sql`
        INSERT INTO profiles (
          user_id, full_name, email, role, created_at, updated_at
        ) VALUES (
          uuid_generate_v4(), 'Sample Client', 'client@example.com', 'client', NOW(), NOW()
        ) RETURNING id
      `
      clientId = newClient[0].id
    }

    // Check if there are existing services
    const existingServices = await sql`SELECT id, name, price FROM services LIMIT 1`

    let serviceId, serviceName, servicePrice

    if (existingServices.length > 0) {
      // Use existing service
      serviceId = existingServices[0].id
      serviceName = existingServices[0].name
      servicePrice = existingServices[0].price

      console.log("Using existing service:", {
        id: serviceId,
        name: serviceName,
        price: servicePrice,
      })
    } else {
      // Create a service based on required columns
      let service

      // Build dynamic SQL for service creation
      if (needsCategory) {
        if (hasUpdatedAt) {
          service = await sql`
            INSERT INTO services (
              name, description, price, duration, provider_id, category, created_at, updated_at
            ) VALUES (
              'Business Consultation', 
              'Professional business consultation service', 
              150.00, 
              60,
              ${providerId},
              'Consulting',
              NOW(),
              NOW()
            ) RETURNING id, name, price
          `
        } else {
          service = await sql`
            INSERT INTO services (
              name, description, price, duration, provider_id, category, created_at
            ) VALUES (
              'Business Consultation', 
              'Professional business consultation service', 
              150.00, 
              60,
              ${providerId},
              'Consulting',
              NOW()
            ) RETURNING id, name, price
          `
        }
      } else {
        if (hasUpdatedAt) {
          service = await sql`
            INSERT INTO services (
              name, description, price, duration, provider_id, created_at, updated_at
            ) VALUES (
              'Business Consultation', 
              'Professional business consultation service', 
              150.00, 
              60,
              ${providerId},
              NOW(),
              NOW()
            ) RETURNING id, name, price
          `
        } else {
          service = await sql`
            INSERT INTO services (
              name, description, price, duration, provider_id, created_at
            ) VALUES (
              'Business Consultation', 
              'Professional business consultation service', 
              150.00, 
              60,
              ${providerId},
              NOW()
            ) RETURNING id, name, price
          `
        }
      }

      serviceId = service[0].id
      serviceName = service[0].name
      servicePrice = service[0].price

      console.log("Created service:", {
        id: serviceId,
        name: serviceName,
        price: servicePrice,
      })
    }

    // Verify the service exists
    const serviceCheck = await sql`SELECT id FROM services WHERE id = ${serviceId}`
    console.log("Service check result:", serviceCheck)

    if (serviceCheck.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Bookings table created successfully, but service creation failed.",
        bookingsCreated: false,
      })
    }

    // Create sample bookings
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowFormatted = tomorrow.toISOString().split("T")[0]

    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const nextWeekFormatted = nextWeek.toISOString().split("T")[0]

    // Create bookings
    const booking1 = await sql`
      INSERT INTO bookings (
        provider_id, client_id, service_id, booking_date, start_time, end_time,
        status, service_name, service_fee, location, notes, created_at, updated_at
      ) VALUES (
        ${providerId}, ${clientId}, ${serviceId}, ${tomorrowFormatted}, '09:00:00', '10:00:00',
        'confirmed', ${serviceName}, ${servicePrice}, 'Office', 'Initial consultation', NOW(), NOW()
      ) RETURNING id
    `

    const booking2 = await sql`
      INSERT INTO bookings (
        provider_id, client_id, service_id, booking_date, start_time, end_time,
        status, service_name, service_fee, location, notes, created_at, updated_at
      ) VALUES (
        ${providerId}, ${clientId}, ${serviceId}, ${nextWeekFormatted}, '14:00:00', '15:00:00',
        'pending', ${serviceName}, ${servicePrice}, 'Virtual', 'Follow-up meeting', NOW(), NOW()
      ) RETURNING id
    `

    // Count bookings
    const bookingsCount = await sql`SELECT COUNT(*) FROM bookings`

    return NextResponse.json({
      success: true,
      message: "Bookings table created and sample data added successfully",
      bookingsCreated: true,
      count: bookingsCount[0].count,
      bookingIds: [booking1[0]?.id, booking2[0]?.id],
      serviceColumns: servicesTable.map((col) => col.column_name),
      requiredColumns,
    })
  } catch (error: any) {
    console.error("Error in fix-bookings-complete:", error)
    return NextResponse.json(
      {
        error: `Error: ${error.message || "Unknown error"}`,
        details: error.toString(),
      },
      { status: 500 },
    )
  }
}
