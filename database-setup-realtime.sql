-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  is_active BOOLEAN DEFAULT true,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT false
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature', 'general')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT false,
  admin_notes TEXT
);

-- Create RLS policies for services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Providers can create and manage their own services
CREATE POLICY "Providers can manage their own services" ON services
  USING (provider_id = auth.uid())
  WITH CHECK (provider_id = auth.uid());

-- Everyone can view active services
CREATE POLICY "Everyone can view active services" ON services
  FOR SELECT USING (is_active = true);

-- Create RLS policies for bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Clients can view and manage their own bookings
CREATE POLICY "Clients can manage their own bookings" ON bookings
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Providers can view and update bookings for their services
CREATE POLICY "Providers can view and update their bookings" ON bookings
  USING (provider_id = auth.uid())
  WITH CHECK (provider_id = auth.uid());

-- Create RLS policies for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they've sent or received
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Users can send messages
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Users can mark messages as read if they are the recipient
CREATE POLICY "Recipients can mark messages as read" ON messages
  FOR UPDATE USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid() AND read = true);

-- Create RLS policies for feedback
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can submit and view their own feedback
CREATE POLICY "Users can manage their own feedback" ON feedback
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can view and respond to all feedback
CREATE POLICY "Admins can view all feedback" ON feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

-- Enable realtime subscriptions for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE services, bookings, messages, feedback;

-- Sample data for testing
INSERT INTO services (name, description, price, duration, provider_id)
VALUES 
  ('Business Consultation', 'One-on-one business strategy consultation', 150.00, 60, '00000000-0000-0000-0000-000000000000'),
  ('Legal Document Review', 'Review of legal documents and contracts', 200.00, 90, '00000000-0000-0000-0000-000000000000'),
  ('Tax Planning Session', 'Strategic tax planning for businesses', 175.00, 60, '00000000-0000-0000-0000-000000000000');
