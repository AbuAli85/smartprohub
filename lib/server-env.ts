/**
 * Server-only environment utilities
 * This file should ONLY be imported in server components, API routes, or server actions
 */

// Get a server-side environment variable (non-public)
export function getServerEnv(key: string, defaultValue = ""): string {
  if (typeof window !== "undefined") {
    console.warn(`Attempted to access server environment variable "${key}" from client code`)
    return defaultValue
  }

  return process.env[key] || defaultValue
}

// Get the server token (only available server-side)
export function getServerToken(): string {
  return getServerEnv("TOKEN", "")
}

// Get session expiration time from environment or use default
export function getSessionExpiration(): number {
  const envValue = getServerEnv("SESSION_EXPIRATION", "3600")
  return Number.parseInt(envValue, 10)
}

// Validate a token against the server token
export function validateServerToken(token: string): boolean {
  const serverToken = getServerToken()
  if (!serverToken) return false

  return token === serverToken
}

// Generate a temporary token for client use
export function generateTemporaryToken(): { token: string; expires: number } {
  const expiresIn = 5 * 60 * 1000 // 5 minutes
  const expires = Date.now() + expiresIn
  const random = Math.random().toString(36).substring(2, 15)

  return {
    token: `temp_${random}_${expires}`,
    expires,
  }
}
