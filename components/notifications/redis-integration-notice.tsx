"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function RedisIntegrationNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check if Redis is already integrated
    const isIntegrated =
      typeof window !== "undefined" &&
      (window.__REDIS_INTEGRATED || localStorage.getItem("redis_configured") === "true")

    // Only show if not integrated and not dismissed
    const isDismissed = localStorage.getItem("redis_notice_dismissed") === "true"
    setVisible(!isIntegrated && !isDismissed)
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem("redis_notice_dismissed", "true")
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <img src="https://upstash.com/static/favicon/favicon.ico" alt="Upstash Logo" className="w-8 h-8 mr-2" />
          <div>
            <h3 className="font-medium">Redis Integration Required</h3>
            <p className="text-sm text-gray-600">Configure Upstash Redis for enhanced performance</p>
          </div>
        </div>
        <button onClick={dismiss} className="text-gray-400 hover:text-gray-500">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="mt-3 flex space-x-2">
        <Button variant="outline" size="sm" onClick={dismiss}>
          Dismiss
        </Button>
        <Button asChild size="sm">
          <Link href="/dashboard/settings">Configure Now</Link>
        </Button>
      </div>
    </div>
  )
}
