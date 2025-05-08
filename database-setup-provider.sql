-- Provider clients junction table
CREATE TABLE IF NOT EXISTS provider_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, client_id)
);

-- Provider services table
CREATE TABLE IF NOT EXISTS provider_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider availability table
CREATE TABLE IF NOT EXISTS provider_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'regular' or 'exception'
  day_of_week VARCHAR(20), -- for regular availability (monday, tuesday, etc.)
  exception_date DATE, -- for exceptions
  is_available BOOLEAN DEFAULT TRUE,  tuesday, etc.)
  exception_date DATE, -- for exceptions
  is_available BOOLEAN DEFAULT TRUE,
  start_time TIME, -- start time for availability
  end_time TIME, -- end time for availability
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES provider_services(id) ON DELETE SET NULL,
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

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255),
  participant_ids UUID[] NOT NULL,
  last_message TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants junction table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Insert some sample data for testing
INSERT INTO profiles (id, email, full_name, role, avatar_url)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'provider@example.com', 'Provider User', 'provider', '/placeholder.svg?height=40&width=40&query=P'),
  ('00000000-0000-0000-0000-000000000002', 'client1@example.com', 'John Doe', 'client', '/placeholder.svg?height=40&width=40&query=J'),
  ('00000000-0000-0000-0000-000000000003', 'client2@example.com', 'Jane Smith', 'client', '/placeholder.svg?height=40&width=40&query=J'),
  ('00000000-0000-0000-0000-000000000004', 'client3@example.com', 'Robert Johnson', 'client', '/placeholder.svg?height=40&width=40&query=R'),
  ('00000000-0000-0000-0000-000000000005', 'client4@example.com', 'Emily Davis', 'client', '/placeholder.svg?height=40&width=40&query=E'),
  ('00000000-0000-0000-0000-000000000006', 'client5@example.com', 'Michael Brown', 'client', '/placeholder.svg?height=40&width=40&query=M')
ON CONFLICT (id) DO NOTHING;

-- Add provider-client relationships
INSERT INTO provider_clients (provider_id, client_id)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006')
ON CONFLICT (provider_id, client_id) DO NOTHING;

-- Add provider services
INSERT INTO provider_services (provider_id, name, description, duration, price, category)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Business Consultation', 'General business strategy consultation', 60, 150.00, 'consultation'),
  ('00000000-0000-0000-0000-000000000001', 'Tax Planning', 'Personal or business tax planning and optimization', 90, 200.00, 'consultation'),
  ('00000000-0000-0000-0000-000000000001', 'Financial Analysis', 'Detailed financial analysis and reporting', 120, 250.00, 'assessment'),
  ('00000000-0000-0000-0000-000000000001', 'Marketing Strategy', 'Develop effective marketing strategies', 90, 175.00, 'consultation'),
  ('00000000-0000-0000-0000-000000000001', 'Legal Consultation', 'General legal advice for businesses', 60, 200.00, 'consultation')
ON CONFLICT DO NOTHING;

-- Add provider availability
INSERT INTO provider_availability (provider_id, type, day_of_week, is_available, start_time, end_time)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'regular', 'monday', TRUE, '09:00', '17:00'),
  ('00000000-0000-0000-0000-000000000001', 'regular', 'tuesday', TRUE, '09:00', '17:00'),
  ('00000000-0000-0000-0000-000000000001', 'regular', 'wednesday', TRUE, '09:00', '17:00'),
  ('00000000-0000-0000-0000-000000000001', 'regular', 'thursday', TRUE, '09:00', '17:00'),
  ('00000000-0000-0000-0000-000000000001', 'regular', 'friday', TRUE, '09:00', '17:00'),
  ('00000000-0000-0000-0000-000000000001', 'regular', 'saturday', FALSE, NULL, NULL),
  ('00000000-0000-0000-0000-000000000001', 'regular', 'sunday', FALSE, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Add bookings
INSERT INTO bookings (provider_id, client_id, service_id, booking_date, start_time, end_time, status, service_name, service_fee, notes)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 
   (SELECT id FROM provider_services WHERE name = 'Business Consultation' AND provider_id = '00000000-0000-0000-0000-000000000001' LIMIT 1),
   CURRENT_DATE + INTERVAL '1 day', '10:00', '11:00', 'confirmed', 'Business Consultation', 150.00, 'Initial consultation'),
   
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 
   (SELECT id FROM provider_services WHERE name = 'Tax Planning' AND provider_id = '00000000-0000-0000-0000-000000000001' LIMIT 1),
   CURRENT_DATE + INTERVAL '2 days', '14:30', '16:00', 'pending', 'Tax Planning', 200.00, 'Tax planning for small business'),
   
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 
   (SELECT id FROM provider_services WHERE name = 'Financial Analysis' AND provider_id = '00000000-0000-0000-0000-000000000001' LIMIT 1),
   CURRENT_DATE + INTERVAL '3 days', '11:00', '13:00', 'confirmed', 'Financial Analysis', 250.00, 'Annual financial review'),
   
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 
   (SELECT id FROM provider_services WHERE name = 'Marketing Strategy' AND provider_id = '00000000-0000-0000-0000-000000000001' LIMIT 1),
   CURRENT_DATE + INTERVAL '4 days', '15:00', '16:30', 'cancelled', 'Marketing Strategy', 175.00, 'Digital marketing strategy session'),
   
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 
   (SELECT id FROM provider_services WHERE name = 'Legal Consultation' AND provider_id = '00000000-0000-0000-0000-000000000001' LIMIT 1),
   CURRENT_DATE + INTERVAL '5 days', '09:30', '10:30', 'confirmed', 'Legal Consultation', 200.00, 'Contract review')
ON CONFLICT DO NOTHING;

-- Create conversations
INSERT INTO conversations (id, participant_ids, last_message, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000010', 
   ARRAY['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'], 
   'Looking forward to our meeting tomorrow!', NOW()),
   
  ('00000000-0000-0000-0000-000000000011', 
   ARRAY['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'], 
   'I have some questions about my tax situation.', NOW() - INTERVAL '1 hour'),
   
  ('00000000-0000-0000-0000-000000000012', 
   ARRAY['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004'], 
   'Can we reschedule our appointment?', NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

-- Add conversation participants
INSERT INTO conversation_participants (conversation_id, user_id)
VALUES 
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- Add messages
INSERT INTO messages (conversation_id, sender_id, recipient_id, content, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Hello, I need some business advice.', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'I would be happy to help. What specific areas are you looking to improve?', NOW() - INTERVAL '2 days' + INTERVAL '10 minutes'),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'I need help with my business growth strategy.', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Let\'s schedule a meeting to discuss this in detail.', NOW() - INTERVAL '1 day' + INTERVAL '15 minutes'),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'That sounds great. How about tomorrow?', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes'),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Tomorrow works for me. I have a slot at 10 AM.', NOW() - INTERVAL '1 day' + INTERVAL '45 minutes'),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Perfect, I\'ll see you then.', NOW() - INTERVAL '1 day' + INTERVAL '1 hour'),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Looking forward to our meeting tomorrow!', NOW()),
  
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Hi, I need help with tax planning.', NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'I can definitely help with that. What type of taxes are you concerned about?', NOW() - INTERVAL '3 days' + INTERVAL '20 minutes'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'I have some questions about my tax situation.', NOW() - INTERVAL '1 hour'),
  
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Hello, I\'m looking forward to our financial analysis session.', NOW() - INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'Great! I\'ve prepared some preliminary questions for you.', NOW() - INTERVAL '5 days' + INTERVAL '30 minutes'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Can we reschedule our appointment?', NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;
