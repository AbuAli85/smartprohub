/**
 * Environment utility functions that work in both client and server contexts
 */

// Check if we're in a browser environment
export const isBrowser = () => typeof window !== "undefined"

// Check if we're in a development environment
export function isDevelopmentEnvironment(): boolean {
  if (isBrowser()) {
    // Client-side detection based on hostname
    const hostname = window.location.hostname
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.includes("vercel.app") ||
      hostname.includes(".dev") ||
      hostname.includes("vusercontent.net")
    )
  } else {
    // Server-side detection
    return process.env.NODE_ENV !== "production"
  }
}

// Safe environment variable access
export function getEnvironmentVariable(name: string): string | undefined {
  // In the browser, we can't access process.env directly
  if (isBrowser()) {
    // Try to get from window.__ENV__ if it exists (can be populated at build time)
    const windowEnv = (window as any).__ENV__
    return windowEnv?.[name]
  }

  // In Node.js, we can access process.env
  return process.env[name]
}

// Get public environment variables (those prefixed with NEXT_PUBLIC_)
export function getPublicEnvironmentVariables(): Record<string, string> {
  if (isBrowser()) {
    // In the browser, return a subset of environment variables that are explicitly made public
    return {
      NEXT_PUBLIC_APP_URL: getEnvironmentVariable("NEXT_PUBLIC_APP_URL") || "",
      NEXT_PUBLIC_VERCEL_URL: getEnvironmentVariable("NEXT_PUBLIC_VERCEL_URL") || "",
      NEXT_PUBLIC_APP_VERSION: getEnvironmentVariable("NEXT_PUBLIC_APP_VERSION") || "",
      NEXT_PUBLIC_FEATURE_REALTIME_UPDATES: getEnvironmentVariable("NEXT_PUBLIC_FEATURE_REALTIME_UPDATES") || "",
      // Add other public environment variables as needed
    }
  } else {
    // On the server, filter process.env for NEXT_PUBLIC_ variables
    const publicVars: Record<string, string> = {}
    for (const key in process.env) {
      if (key.startsWith("NEXT_PUBLIC_")) {
        publicVars[key] = process.env[key] || ""
      }
    }
    return publicVars
  }
}
