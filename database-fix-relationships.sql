-- Fix relationships between clients and providers

-- 0. First check and add provider_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'provider_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN provider_id UUID;
  END IF;
END
$$;

-- 1. Ensure provider_id in profiles table has proper foreign key constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_provider_id_fkey;

ALTER TABLE profiles
ADD CONSTRAINT profiles_provider_id_fkey 
FOREIGN KEY (provider_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. Ensure services table has provider_id with proper constraint
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS provider_id UUID;

ALTER TABLE services
DROP CONSTRAINT IF EXISTS services_provider_id_fkey;

ALTER TABLE services
ADD CONSTRAINT services_provider_id_fkey 
FOREIGN KEY (provider_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 3. Fix bookings table to properly reference both client and provider
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS client_id UUID,
ADD COLUMN IF NOT EXISTS provider_id UUID;

ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_client_id_fkey;

ALTER TABLE bookings
ADD CONSTRAINT bookings_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_provider_id_fkey;

ALTER TABLE bookings
ADD CONSTRAINT bookings_provider_id_fkey 
FOREIGN KEY (provider_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 4. Create a provider_clients table if it doesn't exist
CREATE TABLE IF NOT EXISTS provider_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, client_id)
);

-- 5. Check if conversations table exists before modifying it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'conversations'
  ) THEN
    ALTER TABLE conversations 
    ADD COLUMN IF NOT EXISTS participant_ids UUID[] DEFAULT '{}';
  END IF;
END
$$;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_provider_id ON profiles(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_clients_provider_id ON provider_clients(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_clients_client_id ON provider_clients(client_id);
