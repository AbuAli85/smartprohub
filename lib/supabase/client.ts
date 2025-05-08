import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

// Global variable to store the Supabase client instance
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

// Check if Supabase environment variables are configured
export function isSupabaseConfigured(): boolean {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Supabase environment variables are missing or empty")
      return false
    }

    return true
  } catch (error) {
    console.error("Error checking Supabase configuration:", error)
    return false
  }
}

// Create a singleton instance of the Supabase client
export function getSupabaseClient() {
  // For server-side rendering, always create a new instance
  if (typeof window === "undefined") {
    return createDummyClient()
  }

  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance
  }

  try {
    // Check if environment variables are available
    if (!isSupabaseConfigured()) {
      console.warn("Using dummy Supabase client - environment variables not configured")
      return createDummyClient()
    }

    // Create the client with explicit URL and key
    supabaseInstance = createClientComponentClient<Database>({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      options: {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      },
    })

    return supabaseInstance
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    return createDummyClient()
  }
}

// Create a dummy client for fallback
function createDummyClient() {
  console.warn("Using dummy Supabase client - this is for demo purposes only")

  // Demo user data
  const demoUser = {
    id: "demo-user-id",
    email: "demo@example.com",
    user_metadata: { role: "client" },
    created_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
  }

  // Create a more robust dummy client with better method chaining support
  return {
    auth: {
      getSession: async () => ({
        data: {
          session: {
            user: demoUser,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
          },
        },
        error: null,
      }),
      getUser: async () => ({
        data: { user: demoUser },
        error: null,
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback) => {
        // Simulate an auth state change
        setTimeout(() => {
          callback("SIGNED_IN", { user: demoUser })
        }, 100)
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
          error: null,
        }
      },
      refreshSession: async () => ({
        data: {
          session: {
            user: demoUser,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
          },
        },
        error: null,
      }),
    },
    from: (table) => {
      // Create a query builder with proper method chaining
      const queryBuilder = {
        select: (columns) => {
          const filtered = {
            eq: (column, value) => {
              // Support for chaining multiple eq calls
              return {
                ...filtered,
                eq: (nextColumn, nextValue) => {
                  return filtered
                },
                single: async () => {
                  if (table === "profiles" && value === "demo-user-id") {
                    return {
                      data: {
                        id: "demo-user-id",
                        full_name: "Demo User",
                        role: "client",
                        phone: "555-123-4567",
                      },
                      error: null,
                    }
                  }
                  return { data: null, error: null }
                },
                count: (countOption) => {
                  // Return demo counts for different tables
                  if (table === "bookings") return { count: 3, error: null }
                  if (table === "contracts") return { count: 2, error: null }
                  if (table === "messages") return { count: 5, error: null }
                  return { count: 0, error: null }
                },
                limit: (limit) => filtered,
                order: (column, options) => filtered,
                range: (from, to) => filtered,
                then: (callback) => Promise.resolve(callback({ data: [], error: null })),
              }
            },
            neq: () => filtered,
            gt: () => filtered,
            lt: () => filtered,
            gte: () => filtered,
            lte: () => filtered,
            like: () => filtered,
            ilike: () => filtered,
            is: () => filtered,
            in: () => filtered,
            contains: () => filtered,
            containedBy: () => filtered,
            rangeLt: () => filtered,
            rangeGt: () => filtered,
            rangeGte: () => filtered,
            rangeLte: () => filtered,
            rangeAdjacent: () => filtered,
            overlaps: () => filtered,
            textSearch: () => filtered,
            filter: () => filtered,
            not: () => filtered,
            or: () => filtered,
            and: () => filtered,
            limit: () => filtered,
            order: () => filtered,
            range: () => filtered,
            single: async () => ({ data: null, error: null }),
            maybeSingle: async () => ({ data: null, error: null }),
            then: (callback) => Promise.resolve(callback({ data: [], error: null })),
          }
          return filtered
        },
        insert: () => ({
          select: () => ({
            then: (callback) => Promise.resolve(callback({ data: null, error: null })),
          }),
          then: (callback) => Promise.resolve(callback({ data: null, error: null })),
        }),
        update: () => ({
          eq: () => ({
            then: (callback) => Promise.resolve(callback({ data: null, error: null })),
          }),
          then: (callback) => Promise.resolve(callback({ data: null, error: null })),
        }),
        delete: () => ({
          eq: () => ({
            then: (callback) => Promise.resolve(callback({ data: null, error: null })),
          }),
          then: (callback) => Promise.resolve(callback({ data: null, error: null })),
        }),
        rpc: (fn, params) => ({
          then: (callback) => Promise.resolve(callback({ data: null, error: null })),
        }),
      }
      return queryBuilder
    },
    storage: {
      from: (bucket) => ({
        upload: async () => ({ data: { path: "demo-path" }, error: null }),
        download: async () => ({ data: new Blob(), error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "https://example.com/demo-image.jpg" } }),
        list: async () => ({ data: [], error: null }),
        remove: async () => ({ data: null, error: null }),
      }),
    },
  } as any
}

// Export a singleton instance for convenience
export const supabase = typeof window !== "undefined" ? getSupabaseClient() : createDummyClient()
