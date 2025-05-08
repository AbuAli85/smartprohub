import { sql } from "./index"

// This file contains SQL queries for fixing database issues
// These should be executed using the tagged template literal syntax

// SQL query to add provider_id to services table
export const addProviderIdToServicesSQL = () => sql`
  ALTER TABLE services 
  ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES auth.users(id);
`

// SQL query to add client_id to bookings table
export const addClientIdToBookingsSQL = () => sql`
  ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES auth.users(id);
`

// SQL query to add provider_id to bookings table
export const addProviderIdToBookingsSQL = () => sql`
  ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES auth.users(id);
`

// SQL query to fix RLS policies
export const fixRLSPoliciesSQL = () => sql`
  -- Drop and recreate policies for services table
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
`
