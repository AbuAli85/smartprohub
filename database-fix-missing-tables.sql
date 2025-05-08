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

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bookings
CREATE POLICY "Providers can view their bookings" ON bookings
  FOR SELECT USING (auth.uid() = provider_id);
  
CREATE POLICY "Clients can view their bookings" ON bookings
  FOR SELECT USING (auth.uid() = client_id);
  
CREATE POLICY "Providers can insert bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = provider_id);
  
CREATE POLICY "Clients can insert bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = client_id);
  
CREATE POLICY "Providers can update their bookings" ON bookings
  FOR UPDATE USING (auth.uid() = provider_id);
  
CREATE POLICY "Clients can update their bookings" ON bookings
  FOR UPDATE USING (auth.uid() = client_id);

-- Create RLS policies for messages
CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
  
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
  
CREATE POLICY "Users can update messages they sent" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Create RLS policies for conversations
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (auth.uid() = ANY(participant_ids));
  
CREATE POLICY "Users can create conversations they're part of" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = ANY(participant_ids));
  
CREATE POLICY "Users can update conversations they're part of" ON conversations
  FOR UPDATE USING (auth.uid() = ANY(participant_ids));

-- Create RLS policies for conversation_participants
CREATE POLICY "Users can view conversation participants" ON conversation_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id AND auth.uid() = ANY(c.participant_ids)
    )
  );
  
CREATE POLICY "Users can add participants to their conversations" ON conversation_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id AND auth.uid() = ANY(c.participant_ids)
    )
  );
