-- Fix script to add provider_id column where needed

-- First, check if services table needs provider_id
DO $$
BEGIN
    -- Check if provider_id exists in services table
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'provider_id'
    ) THEN
        -- Add provider_id to services table
        ALTER TABLE services ADD COLUMN provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added provider_id column to services table';
    END IF;
    
    -- Check if profiles table has the correct structure
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'provider_id'
    ) AND EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'profiles'
    ) THEN
        -- Add provider_id to profiles table for client-provider relationship
        ALTER TABLE profiles ADD COLUMN provider_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added provider_id column to profiles table';
    END IF;
    
    -- Fix any policies that might be using provider_id incorrectly
    DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
    CREATE POLICY "Users can view their own profile"
      ON profiles FOR SELECT
      USING (auth.uid() = id);
      
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    CREATE POLICY "Users can update their own profile"
      ON profiles FOR UPDATE
      USING (auth.uid() = id);
      
    -- Add policy for providers to view their clients' profiles
    DROP POLICY IF EXISTS "Providers can view their clients profiles" ON profiles;
    CREATE POLICY "Providers can view their clients profiles"
      ON profiles FOR SELECT
      USING (auth.uid() = provider_id);
      
    RAISE NOTICE 'Fixed policies for profiles table';
    
    -- Fix services policies
    DROP POLICY IF EXISTS "Public can view services" ON services;
    CREATE POLICY "Public can view services"
      ON services FOR SELECT
      USING (true);
      
    DROP POLICY IF EXISTS "Providers can manage their services" ON services;
    CREATE POLICY "Providers can manage their services"
      ON services FOR ALL
      USING (
        CASE 
          WHEN provider_id IS NOT NULL THEN auth.uid() = provider_id
          ELSE false
        END
      );
      
    RAISE NOTICE 'Fixed policies for services table';
    
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'Some tables do not exist yet. Run the full database setup first.';
    WHEN undefined_column THEN
        RAISE NOTICE 'Column reference issue. Check table structure.';
    WHEN others THEN
        RAISE NOTICE 'Error: %', SQLERRM;
END $$;
