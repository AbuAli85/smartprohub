/**
 * Application configuration that works in both client and server contexts
 * IMPORTANT: This file must NOT contain any references to sensitive environment variables
 */

// Feature flags and environment-specific settings
export const config = {
  // App information
  app: {
    name: "SmartPRO",
    version:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_APP_VERSION || "1.0.0"
        : process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    url:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_APP_URL || window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "",
  },

  // Environment detection - client-safe approach
  environment: {
    isDevelopment:
      typeof window !== "undefined"
        ? window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1" ||
          window.location.hostname.includes("vercel.app") ||
          window.location.hostname.includes(".dev") ||
          window.location.hostname.includes("vusercontent.net")
        : false, // Default for SSR, will be determined by server-side code
    isProduction:
      typeof window !== "undefined"
        ? !(
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1" ||
            window.location.hostname.includes("vercel.app") ||
            window.location.hostname.includes(".dev") ||
            window.location.hostname.includes("vusercontent.net")
          )
        : true, // Default for SSR, will be determined by server-side code
    isTest: false, // Default for both client and SSR
  },

  // Feature flags
  features: {
    enableSocialLogin:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN === "true"
        : process.env.NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN === "true",
    standaloneMode:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_FEATURE_STANDALONE_MODE === "true"
        : process.env.NEXT_PUBLIC_FEATURE_STANDALONE_MODE === "true",
    realtimeUpdates:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_FEATURE_REALTIME_UPDATES === "true"
        : process.env.NEXT_PUBLIC_FEATURE_REALTIME_UPDATES === "true",
    authentication:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_FEATURE_AUTHENTICATION === "true"
        : process.env.NEXT_PUBLIC_FEATURE_AUTHENTICATION === "true",
    revenueChart:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_FEATURE_REVENUE_CHART === "true"
        : process.env.NEXT_PUBLIC_FEATURE_REVENUE_CHART === "true",
    activityFeed:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_FEATURE_ACTIVITY_FEED === "true"
        : process.env.NEXT_PUBLIC_FEATURE_ACTIVITY_FEED === "true",
    bookings:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_FEATURE_BOOKINGS === "true"
        : process.env.NEXT_PUBLIC_FEATURE_BOOKINGS === "true",
  },

  // Default settings
  defaults: {
    language:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_DEFAULT_LANGUAGE || "en"
        : process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "en",
    theme:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_DEFAULT_THEME || "light"
        : process.env.NEXT_PUBLIC_DEFAULT_THEME || "light",
    currency:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_DEFAULT_CURRENCY || "USD"
        : process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "USD",
    dateFormat:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_DEFAULT_DATE_FORMAT || "MM/DD/YYYY"
        : process.env.NEXT_PUBLIC_DEFAULT_DATE_FORMAT || "MM/DD/YYYY",
    timeFormat:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_DEFAULT_TIME_FORMAT || "h:mm A"
        : process.env.NEXT_PUBLIC_DEFAULT_TIME_FORMAT || "h:mm A",
  },

  // Authentication settings
  auth: {
    // Removed all token-related settings
    sessionExpiration: 3600, // 1 hour in seconds
    enableRegistration:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_ENABLE_REGISTRATION === "true"
        : process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === "true",
  },

  // API and service endpoints
  endpoints: {
    api:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_API_URL || "/api"
        : process.env.NEXT_PUBLIC_API_URL || "/api",
    socket:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_SOCKET_URL || ""
        : process.env.NEXT_PUBLIC_SOCKET_URL || "",
    websocket:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_WEBSOCKET_URL || ""
        : process.env.NEXT_PUBLIC_WEBSOCKET_URL || "",
    ws:
      typeof window !== "undefined"
        ? (window as any).__ENV__?.NEXT_PUBLIC_WS_URL || ""
        : process.env.NEXT_PUBLIC_WS_URL || "",
  },

  // Demo mode settings
  demo: {
    enabled: true,
    defaultRole: "client",
  },
}

// Helper function to check if we're in a browser environment
export const isBrowser = () => typeof window !== "undefined"

// Helper function to check if we're in a development environment - client-safe
export const isDevelopment = () => {
  if (typeof window !== "undefined") {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes(".dev") ||
      window.location.hostname.includes("vusercontent.net")
    )
  }
  // For server-side, we'll use a different approach
  return false
}

// Server-only environment check - this will be tree-shaken from client bundles
export const isServerDevelopment = () => {
  if (typeof window === "undefined") {
    return process.env.NODE_ENV !== "production"
  }
  return false
}

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (featureName: keyof typeof config.features) => {
  return config.features[featureName]
}

// Helper function to get a public environment variable
// IMPORTANT: This function only accesses NEXT_PUBLIC_ prefixed variables
export const getPublicEnv = (key: string, defaultValue = ""): string => {
  // Only allow accessing environment variables with NEXT_PUBLIC_ prefix
  const fullKey = key.startsWith("NEXT_PUBLIC_") ? key : `NEXT_PUBLIC_${key}`

  // Skip any keys containing "TOKEN" to be extra safe
  if (fullKey.includes("TOKEN")) {
    console.warn(`Attempted to access potentially sensitive variable "${fullKey}" from client code`)
    return defaultValue
  }

  if (isBrowser()) {
    return (window as any).__ENV__?.[fullKey] || defaultValue
  }
  return process.env[fullKey] || defaultValue
}
