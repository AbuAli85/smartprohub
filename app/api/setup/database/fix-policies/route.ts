import { NextResponse } from "next/server"
import { sql } from "@/lib/neon/client"

export async function POST() {
  try {
    // Check if tables exist before trying to fix policies
    const tablesExist = await checkTablesExist()

    if (!tablesExist) {
      return NextResponse.json({
        status: "warning",
        message: "Required tables don't exist yet. Create tables first before fixing policies.",
      })
    }

    // Execute each policy statement separately
    const results = await fixPolicies()

    return NextResponse.json({
      status: "success",
      message: "Database policies fixed successfully",
      details: results,
    })
  } catch (error: any) {
    console.error("Error fixing database policies:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fix database policies",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

async function checkTablesExist() {
  try {
    // Check if profiles table exists
    const profilesCheck = await sql`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'profiles'
      ) as exists;
    `

    // Check if services table exists
    const servicesCheck = await sql`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'services'
      ) as exists;
    `

    return profilesCheck[0]?.exists || servicesCheck[0]?.exists
  } catch (error) {
    console.error("Error checking tables:", error)
    return false
  }
}

async function fixPolicies() {
  const results = []

  try {
    // Check if RLS is enabled
    const rlsCheck = await sql`
      SELECT relname, relrowsecurity
      FROM pg_class
      WHERE relname IN ('profiles', 'services')
      AND relkind = 'r';
    `

    // Enable RLS on tables if needed
    for (const row of rlsCheck) {
      if (row && !row.relrowsecurity) {
        try {
          await sql`ALTER TABLE ${sql(row.relname)} ENABLE ROW LEVEL SECURITY;`
          results.push(`Enabled RLS on ${row.relname}`)
        } catch (error: any) {
          results.push(`Error enabling RLS on ${row.relname}: ${error.message}`)
        }
      }
    }

    // Fix profiles policies
    try {
      // Check if profiles table exists
      const profilesExists = await sql`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_name = 'profiles'
        ) as exists;
      `

      if (profilesExists[0]?.exists) {
        // Drop existing policies one by one
        try {
          await sql`DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;`
          results.push("Dropped profiles view policy")
        } catch (error: any) {
          results.push(`Error dropping profiles view policy: ${error.message}`)
        }

        try {
          await sql`DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;`
          results.push("Dropped profiles update policy")
        } catch (error: any) {
          results.push(`Error dropping profiles update policy: ${error.message}`)
        }

        // Create new policies one by one
        try {
          await sql`
            CREATE POLICY "Users can view their own profile"
            ON profiles
            FOR SELECT
            USING (id = current_user_id());
          `
          results.push("Created profiles view policy")
        } catch (error: any) {
          results.push(`Error creating profiles view policy: ${error.message}`)
        }

        try {
          await sql`
            CREATE POLICY "Users can update their own profile"
            ON profiles
            FOR UPDATE
            USING (id = current_user_id());
          `
          results.push("Created profiles update policy")
        } catch (error: any) {
          results.push(`Error creating profiles update policy: ${error.message}`)
        }
      }
    } catch (error: any) {
      results.push(`Error with profiles policies: ${error.message}`)
    }

    // Fix services policies
    try {
      // Check if services table exists
      const servicesExists = await sql`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_name = 'services'
        ) as exists;
      `

      if (servicesExists[0]?.exists) {
        // Check if provider_id column exists
        const providerIdExists = await sql`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'services' 
            AND column_name = 'provider_id'
          ) as exists;
        `

        if (providerIdExists[0]?.exists) {
          // Drop existing policies one by one
          try {
            await sql`DROP POLICY IF EXISTS "Public can view services" ON services;`
            results.push("Dropped services view policy")
          } catch (error: any) {
            results.push(`Error dropping services view policy: ${error.message}`)
          }

          try {
            await sql`DROP POLICY IF EXISTS "Providers can manage their services" ON services;`
            results.push("Dropped services manage policy")
          } catch (error: any) {
            results.push(`Error dropping services manage policy: ${error.message}`)
          }

          // Create new policies one by one
          try {
            await sql`
              CREATE POLICY "Public can view services"
              ON services
              FOR SELECT
              USING (true);
            `
            results.push("Created services view policy")
          } catch (error: any) {
            results.push(`Error creating services view policy: ${error.message}`)
          }

          try {
            await sql`
              CREATE POLICY "Providers can manage their services"
              ON services
              FOR ALL
              USING (provider_id = current_user_id());
            `
            results.push("Created services manage policy")
          } catch (error: any) {
            results.push(`Error creating services manage policy: ${error.message}`)
          }
        } else {
          results.push("provider_id column doesn't exist on services table")
        }
      }
    } catch (error: any) {
      results.push(`Error with services policies: ${error.message}`)
    }

    return results
  } catch (error: any) {
    throw new Error(`Error fixing policies: ${error.message}`)
  }
}

// Helper function to get current user ID
async function createCurrentUserIdFunction() {
  try {
    await sql`
      CREATE OR REPLACE FUNCTION current_user_id() 
      RETURNS UUID 
      LANGUAGE SQL 
      STABLE 
      AS $$
        SELECT uuid(current_setting('request.jwt.claims', true)::json->>'sub')
      $$;
    `
    return true
  } catch (error) {
    console.error("Error creating current_user_id function:", error)
    return false
  }
}
