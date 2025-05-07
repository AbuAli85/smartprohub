"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function AuthDebuggerWrapper() {
  const [isClearing, setIsClearing] = useState(false)

  const handleClearStorage = async () => {
    setIsClearing(true)
    try {
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })

      // Clear localStorage
      localStorage.clear()

      // Reload the page
      window.location.reload()
    } catch (error) {
      console.error("Error clearing storage:", error)
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <Button variant="destructive" className="w-full" onClick={handleClearStorage} disabled={isClearing}>
      {isClearing ? "Clearing..." : "Clear All Cookies and Storage"}
    </Button>
  )
}
