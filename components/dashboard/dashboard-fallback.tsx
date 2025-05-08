"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import Link from "next/link"

export function DashboardFallback({ error }: { error?: Error }) {
  const isConfigError = !isSupabaseConfigured()

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <CardTitle>{isConfigError ? "Supabase Configuration Error" : "Dashboard Error"}</CardTitle>
          </div>
          <CardDescription>
            {isConfigError
              ? "There was a problem with the Supabase configuration."
              : "There was a problem loading your dashboard."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isConfigError
              ? "Your Supabase environment variables are missing or incorrect. Please check your configuration."
              : error?.message || "An unexpected error occurred. Please try again later."}
          </p>

          <div className="flex flex-col gap-2">
            {isConfigError ? (
              <Button asChild>
                <Link href="/setup/supabase">View Setup Guide</Link>
              </Button>
            ) : (
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            )}

            <Button variant="outline" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
