import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST() {
  try {
    // Connect to the database
    const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || "")

    // First, check if the services table exists
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
          tableExists: false,
        },
        { status: 400 },
      )
    }

    // Check if there are any services
    const servicesCount = await sql`
      SELECT COUNT(*) FROM services
    `

    const hasServices = Number.parseInt(servicesCount[0].count) > 0

    // If no services exist, create a sample service
    let serviceData = null

    if (!hasServices) {
      // Get a provider ID
      const providers = await sql`
        SELECT id FROM profiles 
        WHERE role = 'provider' OR role = 'admin'
        LIMIT 1
      `

      let providerId
      if (providers.length > 0) {
        providerId = providers[0].id
      } else {
        // If no provider exists, get any profile
        const anyProfile = await sql`
          SELECT id FROM profiles LIMIT 1
        `

        if (anyProfile.length === 0) {
          return NextResponse.json(
            {
              error: "No profiles found in the database. Please create profiles first.",
              tableExists: true,
              hasServices: false,
            },
            { status: 400 },
          )
        }

        providerId = anyProfile[0].id
      }

      // Create a sample service
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
        RETURNING id, name, price, provider_id
      `

      if (newService.length === 0) {
        return NextResponse.json(
          {
            error: "Failed to create a sample service.",
            tableExists: true,
            hasServices: false,
          },
          { status: 500 },
        )
      }

      serviceData = newService[0]
    } else {
      // Get an existing service
      const existingService = await sql`
        SELECT id, name, price, provider_id FROM services LIMIT 1
      `

      serviceData = existingService[0]
    }

    // Verify the service exists in the database
    const verifyService = await sql`
      SELECT id FROM services WHERE id = ${serviceData.id}
    `

    if (verifyService.length === 0) {
      return NextResponse.json(
        {
          error: "Service verification failed. The service ID does not exist in the database.",
          tableExists: true,
          hasServices: hasServices,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: hasServices ? "Services already exist" : "Sample service created successfully",
      tableExists: true,
      hasServices: true,
      service: serviceData,
    })
  } catch (error: any) {
    console.error("Error checking/fixing services:", error)
    return NextResponse.json(
      {
        error: `Error checking/fixing services: ${error.message || "Unknown error"}`,
        details: error.toString(),
      },
      { status: 500 },
    )
  }
}
