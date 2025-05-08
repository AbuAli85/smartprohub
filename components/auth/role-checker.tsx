"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "./auth-provider"
import { supabase } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react"

type RoleCheckerProps = {
  children: React.ReactNode
  allowedRoles: string[]
  fallback?: React.ReactNode
}

export function RoleChecker({ children, allowedRoles, fallback }: RoleCheckerProps) {
  const { user, isLoading: authLoading } = useAuth()
  const [role, setRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const checkRole = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // First check if we have user metadata with role
      if (user?.user_metadata?.role) {
        const userRole = user.user_metadata.role as string
        setRole(userRole)
        setIsAuthorized(allowedRoles.includes(userRole))
        setIsLoading(false)
        return
      }

      // If no role in metadata, try to fetch from profiles table
      const { data, error } = await supabase.from("profiles").select("role").eq("id", user?.id).single()

      if (error) {
        console.error("Error fetching role:", error)
        setError(`Error fetching role: ${error.message}`)

        // Default to client role if there's an error
        const defaultRole = "client"
        setRole(defaultRole)
        setIsAuthorized(allowedRoles.includes(defaultRole))
      } else {
        const userRole = data?.role as string
        setRole(userRole)
        setIsAuthorized(allowedRoles.includes(userRole))
      }
    } catch (err) {
      console.error("Exception checking role:", err)
      setError(`Failed to check role: ${err instanceof Error ? err.message : String(err)}`)

      // Default to client role if there's an exception
      const defaultRole = "client"
      setRole(defaultRole)
      setIsAuthorized(allowedRoles.includes(defaultRole))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      checkRole()
    } else if (!authLoading && !user) {
      setIsLoading(false)
      setIsAuthorized(false)
    }
  }, [user, authLoading])

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking authorization...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authorization Issue</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">Using default authorization. Some features may be limited.</div>
            <Button variant="outline" size="sm" className="mt-2" onClick={checkRole}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
        {isAuthorized
          ? children
          : fallback || (
              <div className="p-4 text-center">
                <h2 className="text-lg font-semibold">Access Restricted</h2>
                <p className="text-muted-foreground">You don't have permission to access this area.</p>
              </div>
            )}
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      fallback || (
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold">Access Restricted</h2>
          <p className="text-muted-foreground">You don't have permission to access this area.</p>
        </div>
      )
    )
  }

  return <>{children}</>
}
