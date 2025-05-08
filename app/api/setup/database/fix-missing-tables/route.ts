import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import fs from "fs"
import path from "path"

export async function POST() {
  try {
    // Connect to the database
    const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || "")

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "database-fix-missing-tables-revised.sql")
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
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  service_name VARCHAR(255) NOT NULL,
  service_fee DECIMAL(10, 2),
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table if it doesn't exist (needed for messages)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255),
  participant_ids UUID[] NOT NULL,
  last_message TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation_participants table if it doesn't exist (needed for messages)
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Add conversation_id to messages table if it doesn't exist
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Note: RLS policies have been removed as they require the Supabase auth schema
-- Access control will be handled at the application level instead
      `
    }

    // Split the SQL content into individual statements
    const statements = sqlContent.split(";").filter((stmt) => stmt.trim() !== "")

    // Execute each statement separately
    const results = []
    for (const statement of statements) {
      try {
        await sql.query(statement)
        results.push({ success: true, statement: statement.substring(0, 50) + "..." })
      } catch (error: any) {
        console.error(`Error executing statement: ${statement.substring(0, 100)}...`, error)
        results.push({
          success: false,
          statement: statement.substring(0, 50) + "...",
          error: error.message,
        })
        // Continue with other statements even if one fails
      }
    }

    // Check if tables were created successfully
    const tablesCheck = await sql`
      SELECT 
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') as bookings_exists,
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') as messages_exists,
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') as conversations_exists,
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants') as participants_exists
    `

    return NextResponse.json({
      success: true,
      message: "Database tables fix executed successfully",
      tablesCheck: tablesCheck[0],
      results,
    })
  } catch (error: any) {
    console.error("Error fixing missing tables:", error)
    return NextResponse.json({ error: error.message || "Failed to fix missing database tables" }, { status: 500 })
  }
}
