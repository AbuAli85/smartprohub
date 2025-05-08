-- Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  service_name VARCHAR(255) NOT NULL,
  service_fee DECIMAL(10, 2) NOT NULL,
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS bookings_provider_id_idx ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS bookings_client_id_idx ON bookings(client_id);
CREATE INDEX IF NOT EXISTS bookings_service_id_idx ON bookings(service_id);
CREATE INDEX IF NOT EXISTS bookings_date_idx ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
