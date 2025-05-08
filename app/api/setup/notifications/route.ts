import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // Create a Supabase client using environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // SQL script to set up notifications
    const sqlScript = `
    -- Create notifications table if it doesn't exist
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL, -- 'message', 'booking', 'contract', 'system'
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      action_url TEXT,
      sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
      sender_name TEXT
    );

    -- Create index for faster lookups
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

    -- Create messages table if it doesn't exist
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      conversation_id UUID NOT NULL,
      content TEXT NOT NULL,
      attachment_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      status VARCHAR(20) DEFAULT 'sent',
      is_read BOOLEAN DEFAULT FALSE
    );

    -- Create conversations table if it doesn't exist
    CREATE TABLE IF NOT EXISTS conversations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_message TEXT,
      last_message_time TIMESTAMP WITH TIME ZONE
    );

    -- Create conversation participants table if it doesn't exist
    CREATE TABLE IF NOT EXISTS conversation_participants (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      UNIQUE(conversation_id, user_id)
    );

    -- Create function to create message notification
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
          sender_name,
          action_url
        ) VALUES (
          NEW.recipient_id,
          'message',
          'New message',
          SUBSTRING(NEW.content, 1, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
          NEW.sender_id,
          sender_name,
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
    EXECUTE FUNCTION create_message_notification();
    `

    // Execute the SQL script
    const { error } = await supabase.rpc("run_sql", { sql: sqlScript })

    if (error) {
      console.error("Error setting up notifications:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to set up notifications",
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Notifications and messaging tables set up successfully",
    })
  } catch (error: any) {
    console.error("Error setting up notifications:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to set up notifications",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
