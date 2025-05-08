/**
 * Application configuration
 */
export const config = {
  // Base URL of the application
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Authentication configuration
  auth: {
    // URL for NextAuth.js
    nextAuthUrl: process.env.NEXTAUTH_URL,

    // Supabase configuration
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  },

  // CORS configuration
  cors: {
    // Allowed origins for CORS
    allowedOrigins: [
      "https://smartpro-business-hub.vercel.app",
      "https://smartpro-business-hub-git-main.vercel.app",
      "http://localhost:3000",
    ],
  },
}
