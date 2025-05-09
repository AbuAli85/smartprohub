"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"
import { isRedisAvailable } from "@/lib/redis/client"

export function RedisStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking")

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const available = await isRedisAvailable()
        setStatus(available ? "connected" : "disconnected")
      } catch (error) {
        console.error("Error checking Redis status:", error)
        setStatus("disconnected")
      }
    }

    checkStatus()

    // Check status periodically
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          Upstash Redis Integration
          {status === "connected" ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" /> Connected
            </Badge>
          ) : status === "disconnected" ? (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <XCircle className="h-3 w-3 mr-1" /> Disconnected
            </Badge>
          ) : (
            <Badge variant="outline">Checking...</Badge>
          )}
        </CardTitle>
        <CardDescription>Redis integration status and configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          {status === "connected"
            ? "Redis is properly configured and connected. The application is using Redis for caching and session management."
            : status === "disconnected"
              ? "Redis is not connected. Configure Redis in the settings to enable enhanced caching and session management."
              : "Checking Redis connection status..."}
        </p>
      </CardContent>
    </Card>
  )
}
