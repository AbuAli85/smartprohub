import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // Create a Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Read the SQL file
    const sqlScript = `
    -- Create notifications table if it doesn't exist
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL, -- 'message', 'booking', 'contract', 'system'
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      action_url TEXT,
      sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL
    );

    -- Create index for faster lookups
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

    -- Add function to create message notification
    CREATE OR REPLACE FUNCTION create_message_notification()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Get sender name
      DECLARE
        sender_name TEXT;
      BEGIN
        SELECT full_name INTO sender_name FROM profiles WHERE id = NEW.sender_id;
        
        -- Create notification for recipient
        INSERT INTO notifications (
          user_id,
          type,
          title,
          content,
          sender_id,
          action_url
        ) VALUES (
          NEW.recipient_id,
          'message',
          'New message from ' || sender_name,
          SUBSTRING(NEW.content, 1, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
          NEW.sender_id,
          '/messages?conversation=' || NEW.conversation_id
        );
      END;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create trigger for new messages
    DROP TRIGGER IF EXISTS trigger_create_message_notification ON messages;
    CREATE TRIGGER trigger_create_message_notification
    AFTER INSERT ON messages
    FOR EACH ROW
    WHEN (NEW.sender_id IS NOT NULL AND NEW.recipient_id IS NOT NULL)
    EXECUTE FUNCTION create_message_notification();

    -- Add function to create booking notification
    CREATE OR REPLACE FUNCTION create_booking_notification()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Get client and provider names
      DECLARE
        client_name TEXT;
        provider_name TEXT;
        service_name TEXT;
      BEGIN
        SELECT full_name INTO client_name FROM profiles WHERE id = NEW.client_id;
        SELECT full_name INTO provider_name FROM profiles WHERE id = NEW.provider_id;
        
        -- Create notification for provider
        INSERT INTO notifications (
          user_id,
          type,
          title,
          content,
          sender_id,
          action_url
        ) VALUES (
          NEW.provider_id,
          'booking',
          'New booking from ' || client_name,
          'You have a new booking for ' || NEW.service_name || ' on ' || NEW.booking_date || ' at ' || NEW.start_time,
          NEW.client_id,
          '/provider/bookings'
        );
        
        -- Create notification for client
        INSERT INTO notifications (
          user_id,
          type,
          title,
          content,
          sender_id,
          action_url
        ) VALUES (
          NEW.client_id,
          'booking',
          'Booking confirmation',
          'Your booking for ' || NEW.service_name || ' with ' || provider_name || ' on ' || NEW.booking_date || ' at ' || NEW.start_time || ' has been created.',
          NEW.provider_id,
          '/client/bookings'
        );
      END;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create trigger for new bookings
    DROP TRIGGER IF EXISTS trigger_create_booking_notification ON bookings;
    CREATE TRIGGER trigger_create_booking_notification
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION create_booking_notification();
    `

    // Execute the SQL script
    const { error } = await supabase.rpc("run_sql", { sql: sqlScript })

    if (error) {
      console.error("Error setting up notifications:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Notifications setup completed successfully" })
  } catch (error: any) {
    console.error("Error in notifications setup:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
