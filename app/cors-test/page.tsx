"use client"

import { useState, useEffect } from "react"

export default function CorsTestPage() {
  const [result, setResult] = useState<string>("Testing...")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testCors() {
      try {
        // Test the auth-test API endpoint
        const response = await fetch("/api/auth-test")
        const data = await response.json()

        setResult(JSON.stringify(data, null, 2))
        setError(null)
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    testCors()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CORS Configuration Test</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">API Response:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[300px]">
          {error ? <span className="text-red-500">{error}</span> : result}
        </pre>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">How to test CORS:</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Open this page in your browser</li>
          <li>Check the response above - it should show a successful response</li>
          <li>Open browser developer tools (F12) and check the Console tab</li>
          <li>There should be no CORS-related errors</li>
          <li>Try accessing this page from different origins to test CORS restrictions</li>
        </ol>
      </div>
    </div>
  )
}
