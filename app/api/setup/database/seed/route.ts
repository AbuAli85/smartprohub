import { NextResponse } from "next/server"
import { sql } from "@/lib/neon/client"

export async function POST() {
  try {
    // Insert sample profiles instead of users
    await sql.query(`
      INSERT INTO profiles (id, email, full_name, role, avatar_url)
      VALUES 
        ('00000000-0000-0000-0000-000000000001', 'admin@smartpro.com', 'Admin User', 'admin', '/letter-a-abstract.png'),
        ('00000000-0000-0000-0000-000000000002', 'provider@smartpro.com', 'Provider User', 'provider', '/letter-p-typography.png'),
        ('00000000-0000-0000-0000-000000000003', 'client@smartpro.com', 'Client User', 'client', '/letter-c-typography.png')
      ON CONFLICT (id) DO NOTHING;
    `)

    // Get profile IDs
    const profiles = await sql.query(`
      SELECT id, email, role FROM profiles 
      WHERE email IN ('admin@smartpro.com', 'provider@smartpro.com', 'client@smartpro.com');
    `)

    const adminId = profiles.find((u: any) => u.role === "admin")?.id
    const providerId = profiles.find((u: any) => u.role === "provider")?.id
    const clientId = profiles.find((u: any) => u.role === "client")?.id

    // Insert provider profile
    if (providerId) {
      await sql.query(`
        INSERT INTO provider_services (id, provider_id, name, description, duration, price, category, is_active)
        VALUES 
          (uuid_generate_v4(), '${providerId}', 'Business Consultation', 'One-on-one business consultation session', 60, 150.00, 'Consultation', true),
          (uuid_generate_v4(), '${providerId}', 'Financial Planning', 'Comprehensive financial planning session', 90, 200.00, 'Financial', true),
          (uuid_generate_v4(), '${providerId}', 'Marketing Strategy', 'Marketing strategy development session', 120, 250.00, 'Marketing', true)
        ON CONFLICT DO NOTHING;
      `)
    }

    // Insert client profile
    if (clientId && providerId) {
      // Get services
      const services = await sql.query(`
        SELECT id FROM provider_services WHERE provider_id = '${providerId}' LIMIT 1;
      `)

      const serviceId = services[0]?.id

      if (serviceId) {
        // Create a booking
        await sql.query(`
          INSERT INTO bookings (id, client_id, service_id, provider_id, booking_date, start_time, end_time, status, service_name, service_fee)
          VALUES (
            uuid_generate_v4(), 
            '${clientId}', 
            '${serviceId}', 
            '${providerId}', 
            CURRENT_DATE + INTERVAL '1 day', 
            '10:00:00', 
            '11:00:00', 
            'pending',
            'Business Consultation',
            150.00
          )
          ON CONFLICT DO NOTHING;
        `)

        // Create a contract
        await sql.query(`
          INSERT INTO contracts (id, provider_id, client_id, title, content, status, start_date, end_date, value)
          VALUES (
            uuid_generate_v4(),
            '${providerId}',
            '${clientId}',
            'Business Services Agreement',
            'This is a sample contract for business services between the provider and client.',
            'draft',
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '30 days',
            1500.00
          )
          ON CONFLICT DO NOTHING;
        `)

        // Create a conversation
        await sql.query(`
          INSERT INTO conversations (id, title, participant_ids, last_message)
          VALUES (
            uuid_generate_v4(),
            'Project Discussion',
            ARRAY['${providerId}', '${clientId}'],
            'Hello, I would like to discuss the project details.'
          )
          ON CONFLICT DO NOTHING;
        `)

        // Get the conversation
        const conversations = await sql.query(`
          SELECT id FROM conversations 
          WHERE '${providerId}' = ANY(participant_ids) AND '${clientId}' = ANY(participant_ids)
          LIMIT 1;
        `)

        const conversationId = conversations[0]?.id

        if (conversationId) {
          // Add conversation participants
          await sql.query(`
            INSERT INTO conversation_participants (id, conversation_id, user_id)
            VALUES 
              (uuid_generate_v4(), '${conversationId}', '${providerId}'),
              (uuid_generate_v4(), '${conversationId}', '${clientId}')
            ON CONFLICT DO NOTHING;
          `)

          // Add messages
          await sql.query(`
            INSERT INTO messages (id, conversation_id, sender_id, recipient_id, content, read)
            VALUES 
              (uuid_generate_v4(), '${conversationId}', '${clientId}', '${providerId}', 'Hello, I would like to discuss the project details.', true),
              (uuid_generate_v4(), '${conversationId}', '${providerId}', '${clientId}', 'Sure, I am available tomorrow at 10 AM.', false)
            ON CONFLICT DO NOTHING;
          `)
        }
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
