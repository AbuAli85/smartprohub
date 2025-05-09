"use client"

import { useState, useEffect } from "react"

export function useSecureToken() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchToken() {
      try {
        setLoading(true)
        const response = await fetch("/api/auth/secure-token")

        if (!response.ok) {
          throw new Error("Failed to fetch token")
        }

        const data = await response.json()
        setToken(data.tempToken)
        setError(null)
      } catch (err) {
        console.error("Error fetching token:", err)
        setError(err instanceof Error ? err : new Error("Unknown error"))
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [])

  return { token, loading, error }
}
