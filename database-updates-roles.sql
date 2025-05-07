-- Add provider_id to profiles table for client-provider relationships
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES profiles(id) NULL;

-- Update the handle_new_user function to include role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url, 
    email, 
    role
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'client')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create additional RLS policies for role-based access

-- Providers can view their clients
CREATE POLICY "Providers can view their clients profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'provider'
    ) AND provider_id = auth.uid()
  );

-- Clients can view their provider's profile
CREATE POLICY "Clients can view their provider's profile"
  ON profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'client'
    ) AND id = (SELECT provider_id FROM profiles WHERE id = auth.uid())
  );

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Admin can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Providers can view bookings for their clients
CREATE POLICY "Providers can view their clients' bookings"
  ON bookings FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'provider'
    ) AND user_id IN (
      SELECT id FROM profiles WHERE provider_id = auth.uid()
    )
  );

-- Admin can view all bookings
CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Similar policies for contracts and messages
