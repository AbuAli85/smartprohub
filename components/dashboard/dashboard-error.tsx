"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { isSupabaseConfigured } from "@/lib/supabase/client"

export function DashboardError({ error }: { error?: Error }) {
  const isSupabaseError = error?.message?.includes("Supabase") || !isSupabaseConfigured()

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{isSupabaseError ? "Supabase Configuration Error" : "Dashboard Error"}</AlertTitle>
        <AlertDescription>
          {isSupabaseError
            ? "There was a problem with the Supabase configuration. Please check your environment variables."
            : error?.message || "There was a problem loading the dashboard."}
        </AlertDescription>
      </Alert>

      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">Go to Home</Link>
        </Button>

        {isSupabaseError && (
          <Button asChild variant="outline">
            <Link href="/setup/supabase">Setup Supabase</Link>
          </Button>
        )}

        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  )
}
