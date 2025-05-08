"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Database, ArrowRight } from "lucide-react"
import Link from "next/link"

interface DashboardFallbackProps {
  error?: string
  title?: string
  description?: string
}

export function DashboardFallback({
  error = "Database tables not set up properly.",
  title = "Database Setup Required",
  description = "Your database needs to be initialized before you can use the dashboard.",
}: DashboardFallbackProps) {
  return (
    <div className="container mx-auto py-10">
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Database Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            We've detected that your database tables haven't been set up yet. Before you can use the SmartPRO Business
            Services Hub, you need to initialize your database.
          </p>
          <p className="text-sm text-muted-foreground">
            Our setup wizard will guide you through the process of creating the necessary tables and adding sample data
            to get you started.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full flex items-center justify-center gap-2">
            <Link href="/setup/database">
              Go to Database Setup
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
