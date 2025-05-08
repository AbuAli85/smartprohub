-- Create provider_services table if it doesn't exist
CREATE TABLE IF NOT EXISTS provider_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on provider_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_provider_services_provider_id ON provider_services(provider_id);

-- Enable Row Level Security
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow providers to see only their own services
CREATE POLICY "Providers can view their own services" 
  ON provider_services 
  FOR SELECT 
  USING (auth.uid() = provider_id);

-- Allow providers to insert their own services
CREATE POLICY "Providers can insert their own services" 
  ON provider_services 
  FOR INSERT 
  WITH CHECK (auth.uid() = provider_id);

-- Allow providers to update their own services
CREATE POLICY "Providers can update their own services" 
  ON provider_services 
  FOR UPDATE 
  USING (auth.uid() = provider_id);

-- Allow providers to delete their own services
CREATE POLICY "Providers can delete their own services" 
  ON provider_services 
  FOR DELETE 
  USING (auth.uid() = provider_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the updated_at timestamp
DROP TRIGGER IF EXISTS update_provider_services_updated_at ON provider_services;
CREATE TRIGGER update_provider_services_updated_at
BEFORE UPDATE ON provider_services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
