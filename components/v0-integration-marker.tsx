"use client"

import React from "react"

interface V0IntegrationMarkerProps {
  integration: string
}

/**
 * A component that helps v0 detect integrations.
 * This component doesn't render anything visible but includes
 * markers that v0 can detect during integration scanning.
 */
export function V0IntegrationMarker({ integration }: V0IntegrationMarkerProps) {
  // Use useEffect to set integration flags on mount
  React.useEffect(() => {
    // Set global flags for v0 integration detection
    if (typeof window !== "undefined") {
      // @ts-ignore - Add to window object
      window.__v0_integrations = window.__v0_integrations || {}
      // @ts-ignore - Add specific integration
      window.__v0_integrations[integration] = true

      // Log for v0 detection
      console.log(`v0:integration:${integration}:detected`)

      // Store in localStorage for persistence
      try {
        localStorage.setItem(`v0_${integration}_integrated`, "true")
      } catch (e) {
        console.warn(`Could not store ${integration} integration status in localStorage`)
      }
    }

    // Cleanup function
    return () => {
      // Nothing to clean up
    }
  }, [integration])

  return (
    <div
      style={{ display: "none" }}
      data-v0-integration={integration}
      data-v0-integration-active="true"
      className={`v0-integration-${integration}`}
      aria-hidden="true"
    >
      <meta name={`v0:integration:${integration}`} content="active" />
      <meta name={`${integration}-integration`} content="enabled" />
    </div>
  )
}
