import { neon, neonConfig } from "@neondatabase/serverless"
import { Pool } from "@neondatabase/serverless"

// Configure Neon with reasonable defaults
neonConfig.fetchConnectionCache = true
neonConfig.fetchTimeout = 10000 // 10 seconds timeout

// Update the getDatabaseUrl function to provide better error handling and fallback options
const getDatabaseUrl = () => {
  const url =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.NEON_POSTGRES_URL

  if (!url) {
    console.error(
      "No database URL found in environment variables. Please set one of: POSTGRES_URL, DATABASE_URL, NEON_DATABASE_URL, or NEON_POSTGRES_URL",
    )
    // Return a placeholder for development that will be caught and handled gracefully
    return null
  }

  return url
}

// Create and export the SQL client directly
export const sql = neon(getDatabaseUrl() || "")

// Execute a query with parameters - named export required by other modules
export const executeQuery = async (text: string, params: any[] = []) => {
  try {
    console.log("Executing query:", text, "with params:", params)
    const startTime = Date.now()
    const result = await sql(text, params)
    const duration = Date.now() - startTime
    console.log(`Query executed in ${duration}ms`)
    return { rows: result, rowCount: result.length }
  } catch (error) {
    console.error("Database query error:", error)
    return { rows: [], rowCount: 0, error }
  }
}

// Check database connection - named export required by other modules
export const checkDatabaseConnection = async () => {
  try {
    const startTime = Date.now()
    const result = await sql`SELECT 1 as connection_test`
    const duration = Date.now() - startTime
    return {
      status: "connected",
      message: `Connection successful (${duration}ms)`,
      duration,
    }
  } catch (error: any) {
    return {
      status: "error",
      message: error.message,
      error,
    }
  }
}

// Update the createNeonClient function to handle missing database URL more gracefully
export const createNeonClient = () => {
  const databaseUrl = getDatabaseUrl()

  if (!databaseUrl) {
    console.error("Cannot create Neon client: No database URL available")
    return {
      query: async (text: string, params: any[] = []) => {
        console.error("Database operation attempted but no database URL is configured")
        return { rows: [], rowCount: 0, error: "No database URL configured" }
      },
      execute: async (query: string) => {
        console.error("Database operation attempted but no database URL is configured")
        return { rows: [], rowCount: 0, error: "No database URL configured" }
      },
      healthCheck: async () => {
        return {
          status: "error",
          message: "No database URL configured in environment variables",
          error: new Error("Missing database URL"),
        }
      },
    }
  }

  return {
    // Execute a query with parameters
    query: async (text: string, params: any[] = []) => {
      return executeQuery(text, params)
    },

    // Execute a raw SQL query
    execute: async (query: string) => {
      try {
        console.log("Executing raw SQL:", query)
        const startTime = Date.now()
        const result = await sql(query)
        const duration = Date.now() - startTime
        console.log(`SQL executed in ${duration}ms`)
        return { rows: result, rowCount: result.length }
      } catch (error) {
        console.error("Database execution error:", error)
        return { rows: [], rowCount: 0, error }
      }
    },

    // Check if the database connection is working
    healthCheck: async () => {
      return checkDatabaseConnection()
    },
  }
}

// Create a connection pool for more intensive operations
export const createConnectionPool = () => {
  const databaseUrl = getDatabaseUrl()

  if (!databaseUrl) {
    console.error("Cannot create connection pool: No database URL available")
    return null
  }

  try {
    return new Pool({ connectionString: databaseUrl })
  } catch (error) {
    console.error("Error creating connection pool:", error)
    return null
  }
}

// Export a singleton instance for convenience
export const db = createNeonClient()
