import { neon } from "@neondatabase/serverless"

// Initialize Neon SQL client
let neonClient: ReturnType<typeof neon> | null = null

export function getNeonClient() {
  if (!neonClient) {
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL

    if (!databaseUrl) {
      console.warn("Neon database URL is not set")
      return null
    }

    neonClient = neon(databaseUrl)
  }

  return neonClient
}

// Example function to execute a query
export async function executeQuery(query: string, params: any[] = []) {
  const sql = getNeonClient()
  if (!sql) {
    throw new Error("Neon database client is not initialized")
  }

  try {
    return await sql(query, params)
  } catch (error) {
    console.error("Error executing Neon database query:", error)
    throw error
  }
}

// Example function to get a user by ID
export async function getUserById(userId: string) {
  return executeQuery("SELECT * FROM users WHERE id = $1", [userId])
}

// Example function to create a booking
export async function createBooking(bookingData: any) {
  const { client_id, provider_id, service_id, booking_date, status } = bookingData

  return executeQuery(
    `INSERT INTO bookings (client_id, provider_id, service_id, booking_date, status) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [client_id, provider_id, service_id, booking_date, status],
  )
}
