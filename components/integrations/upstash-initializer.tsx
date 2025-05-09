"use client"

import { useEffect } from "react"
import { initUpstashIntegration } from "@/lib/integrations/upstash"

export function UpstashInitializer() {
  useEffect(() => {
    // Initialize Upstash integration
    initUpstashIntegration()

    // Add a meta tag to indicate Upstash integration
    const meta = document.createElement("meta")
    meta.name = "v0:integration:upstash"
    meta.content = "active"
    document.head.appendChild(meta)

    return () => {
      // Clean up meta tag on unmount
      const metaTag = document.querySelector('meta[name="v0:integration:upstash"]')
      if (metaTag) {
        metaTag.remove()
      }
    }
  }, [])

  // This component doesn't render anything
  return null
}
