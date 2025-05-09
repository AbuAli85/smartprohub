"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { initializeRedis } from "@/lib/redis/init"

export function RedisProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Initialize Redis on client side
    const init = async () => {
      try {
        await initializeRedis()
        setInitialized(true)

        // Set a flag to indicate Redis is integrated
        if (typeof window !== "undefined") {
          window.__REDIS_INTEGRATED = true
        }
      } catch (error) {
        console.error("Redis initialization error:", error)
      }
    }

    init()
  }, [])

  return <>{children}</>
}
