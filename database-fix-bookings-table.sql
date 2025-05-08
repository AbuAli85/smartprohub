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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Providers can view their bookings'
  ) THEN
    CREATE POLICY "Providers can view their bookings" ON bookings
      FOR SELECT USING (auth.uid() = provider_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Clients can view their bookings'
  ) THEN
    CREATE POLICY "Clients can view their bookings" ON bookings
      FOR SELECT USING (auth.uid() = client_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Providers can insert bookings'
  ) THEN
    CREATE POLICY "Providers can insert bookings" ON bookings
      FOR INSERT WITH CHECK (auth.uid() = provider_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Clients can insert bookings'
  ) THEN
    CREATE POLICY "Clients can insert bookings" ON bookings
      FOR INSERT WITH CHECK (auth.uid() = client_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Providers can update their bookings'
  ) THEN
    CREATE POLICY "Providers can update their bookings" ON bookings
      FOR UPDATE USING (auth.uid() = provider_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Clients can update their bookings'
  ) THEN
    CREATE POLICY "Clients can update their bookings" ON bookings
      FOR UPDATE USING (auth.uid() = client_id);
  END IF;
END
$$;
