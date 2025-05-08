import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const setupType = body.setup

    if (setupType === "provider_services") {
      // SQL to create the provider_services table
      const { error } = await supabase.rpc("setup_provider_services_table")

      if (error) {
        console.error("Error setting up provider_services table:", error)

        // If the RPC function doesn't exist, create the table directly
        if (error.code === "42883") {
          // function does not exist
          const createTableSQL = `
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
            CREATE POLICY IF NOT EXISTS "Providers can view their own services" 
              ON provider_services 
              FOR SELECT 
              USING (auth.uid() = provider_id);
            
            -- Allow providers to insert their own services
            CREATE POLICY IF NOT EXISTS "Providers can insert their own services" 
              ON provider_services 
              FOR INSERT 
              WITH CHECK (auth.uid() = provider_id);
            
            -- Allow providers to update their own services
            CREATE POLICY IF NOT EXISTS "Providers can update their own services" 
              ON provider_services 
              FOR UPDATE 
              USING (auth.uid() = provider_id);
            
            -- Allow providers to delete their own services
            CREATE POLICY IF NOT EXISTS "Providers can delete their own services" 
              ON provider_services 
              FOR DELETE 
              USING (auth.uid() = provider_id);
          `

          const { error: sqlError } = await supabase.rpc("run_sql", { sql: createTableSQL })

          if (sqlError) {
            console.error("Error creating table directly:", sqlError)
            return NextResponse.json({ error: sqlError.message }, { status: 500 })
          }
        } else {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
      }

      return NextResponse.json({ success: true, message: "Provider services table setup completed" })
    }

    return NextResponse.json({ error: "Invalid setup type" }, { status: 400 })
  } catch (error: any) {
    console.error("Error in database setup:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
