export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = "admin" | "provider" | "client"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          email: string
          phone: string | null
          company: string | null
          position: string | null
          bio: string | null
          provider_id: string | null // For clients to be associated with a provider
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          email: string
          phone?: string | null
          company?: string | null
          position?: string | null
          bio?: string | null
          provider_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          email?: string
          phone?: string | null
          company?: string | null
          position?: string | null
          bio?: string | null
          provider_id?: string | null
        }
      }
      // Other tables remain the same...
    }
    // Views, Functions, Enums remain the same...
  }
}
