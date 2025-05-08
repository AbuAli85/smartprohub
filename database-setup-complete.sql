-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'provider', 'client', 'manager')),
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  position TEXT,
  bio TEXT
);

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

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'signed', 'expired')) DEFAULT 'draft',
  start_date DATE NOT NULL,
  end_date DATE,
  value DECIMAL(10, 2)
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

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  category TEXT NOT NULL
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_provider_clients_provider_id ON provider_clients(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_clients_client_id ON provider_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_provider_id ON provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_provider_id ON contracts(provider_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Insert sample data
INSERT INTO services (name, description, price, duration, category)
VALUES
  ('Business Consultation', 'One-on-one business consultation session', 150, 60, 'Consultation'),
  ('Financial Planning', 'Comprehensive financial planning session', 200, 90, 'Financial'),
  ('Marketing Strategy', 'Marketing strategy development session', 250, 120, 'Marketing'),
  ('Legal Consultation', 'Legal advice and consultation', 180, 60, 'Legal'),
  ('Tax Planning', 'Tax planning and optimization', 175, 60, 'Financial'),
  ('HR Consulting', 'Human resources consulting services', 160, 60, 'HR'),
  ('IT Strategy', 'Information technology strategy session', 220, 90, 'IT'),
  ('Sales Training', 'Sales techniques and strategy training', 190, 120, 'Sales')
ON CONFLICT DO NOTHING;

-- Insert sample profiles if they don't exist
INSERT INTO profiles (id, email, full_name, role, avatar_url)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'provider@example.com', 'Provider User', 'provider', '/letter-p-typography.png'),
  ('00000000-0000-0000-0000-000000000002', 'client1@example.com', 'John Doe', 'client', '/letter-j-typography.png'),
  ('00000000-0000-0000-0000-000000000003', 'client2@example.com', 'Jane Smith', 'client', '/letter-j-typography.png'),
  ('00000000-0000-0000-0000-000000000004', 'client3@example.com', 'Robert Johnson', 'client', '/letter-r-typography.png'),
  ('00000000-0000-0000-0000-000000000005', 'client4@example.com', 'Emily Davis', 'client', '/letter-e-abstract.png'),
  ('00000000-0000-0000-0000-000000000006', 'client5@example.com', 'Michael Brown', 'client', '/letter-m-typography.png')
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
