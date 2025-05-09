"use client"

import type React from "react"
import { createContext, useContext, useEffect } from "react"
import { config } from "@/lib/config"

// Define the shape of our environment context
type EnvContextType = {
  isDevelopment: boolean
  isProduction: boolean
  features: typeof config.features
  app: typeof config.app
  defaults: typeof config.defaults
}

// Create the context with default values
const EnvContext = createContext<EnvContextType>({
  isDevelopment: config.environment.isDevelopment,
  isProduction: config.environment.isProduction,
  features: config.features,
  app: config.app,
  defaults: config.defaults,
})

// Hook to use the environment context
export const useEnv = () => useContext(EnvContext)

// Provider component to make environment variables available to client components
export function EnvProvider({ children }: { children: React.ReactNode }) {
  // Initialize window.__ENV__ on mount if it doesn't exist
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).__ENV__) {
      // Create the __ENV__ object if it doesn't exist
      ;(window as any).__ENV__ = {}

      // Populate with NEXT_PUBLIC_ environment variables
      Object.keys(config.features).forEach((key) => {
        const envKey = `NEXT_PUBLIC_FEATURE_${key.toUpperCase()}`
        ;(window as any).__ENV__[envKey] = config.features[key as keyof typeof config.features] ? "true" : "false"
      })

      // Add app info
      ;(window as any).__ENV__["NEXT_PUBLIC_APP_VERSION"] = config.app.version
      ;(window as any).__ENV__["NEXT_PUBLIC_APP_NAME"] = config.app.name
    }
  }, [])

  // Provide the environment context to children
  return (
    <EnvContext.Provider
      value={{
        isDevelopment: config.environment.isDevelopment,
        isProduction: config.environment.isProduction,
        features: config.features,
        app: config.app,
        defaults: config.defaults,
      }}
    >
      {children}
    </EnvContext.Provider>
  )
}
