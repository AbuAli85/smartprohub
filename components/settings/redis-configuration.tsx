"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { testRedisConnection } from "@/lib/redis/test-utils"

export function RedisConfiguration() {
  const [redisUrl, setRedisUrl] = useState("")
  const [redisToken, setRedisToken] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)

  // Check if Redis is already configured on component mount
  useEffect(() => {
    const checkRedisStatus = async () => {
      try {
        // Try to get stored credentials
        if (typeof window !== "undefined") {
          const storedUrl = localStorage.getItem("redis_url")
          const storedToken = localStorage.getItem("redis_token")

          if (storedUrl) setRedisUrl(storedUrl)
          if (storedToken) setRedisToken(storedToken)

          // If we have stored credentials, check if they work
          if (storedUrl && storedToken) {
            setStatus("loading")
            const result = await testRedisConnection(storedUrl, storedToken)

            if (result.success) {
              setStatus("success")
              setMessage("Redis is configured and connected successfully.")
              setIsConfigured(true)
            } else {
              setStatus("error")
              setMessage(`Stored Redis credentials failed: ${result.error}`)
              setIsConfigured(false)
            }
          }
        }
      } catch (error) {
        console.error("Error checking Redis status:", error)
        setStatus("idle")
      }
    }

    checkRedisStatus()
  }, [])

  // Test Redis connection
  const testConnection = async () => {
    setStatus("loading")
    setMessage("Testing connection to Redis...")

    try {
      const result = await testRedisConnection(redisUrl, redisToken)

      if (result.success) {
        // Save to localStorage for persistence
        if (typeof window !== "undefined") {
          localStorage.setItem("redis_url", redisUrl)
          localStorage.setItem("redis_token", redisToken)
          localStorage.setItem("redis_configured", "true")
        }

        setStatus("success")
        setMessage("Successfully connected to Redis!")
        setIsConfigured(true)
      } else {
        setStatus("error")
        setMessage(`Failed to connect to Redis: ${result.error}`)
      }
    } catch (error) {
      console.error("Redis connection test failed:", error)
      setStatus("error")
      setMessage(`Failed to connect to Redis: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Reset configuration
  const resetConfiguration = () => {
    setRedisUrl("")
    setRedisToken("")
    setStatus("idle")
    setIsConfigured(false)

    if (typeof window !== "undefined") {
      localStorage.removeItem("redis_url")
      localStorage.removeItem("redis_token")
      localStorage.removeItem("redis_configured")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConfigured ? <CheckCircle className="h-5 w-5 text-green-500" /> : null}
          Redis Configuration
        </CardTitle>
        <CardDescription>Configure Upstash Redis for improved caching and session management</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "success" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Connected</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="redis-url">Redis URL</Label>
          <Input
            id="redis-url"
            placeholder="https://your-redis-instance.upstash.io"
            value={redisUrl}
            onChange={(e) => setRedisUrl(e.target.value)}
            disabled={status === "loading" || isConfigured}
          />
          <p className="text-sm text-muted-foreground">Your Upstash Redis REST API URL</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="redis-token">Redis Token</Label>
          <Input
            id="redis-token"
            type="password"
            placeholder="Your Redis token"
            value={redisToken}
            onChange={(e) => setRedisToken(e.target.value)}
            disabled={status === "loading" || isConfigured}
          />
          <p className="text-sm text-muted-foreground">Your Upstash Redis REST API token</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isConfigured ? (
          <Button variant="outline" onClick={resetConfiguration} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reconfigure
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              setRedisUrl("")
              setRedisToken("")
              setStatus("idle")
            }}
          >
            Reset
          </Button>
        )}

        <Button
          onClick={testConnection}
          disabled={!redisUrl || !redisToken || status === "loading" || isConfigured}
          className="flex items-center gap-2"
        >
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          {isConfigured ? "Connected" : "Test Connection"}
        </Button>
      </CardFooter>
    </Card>
  )
}
