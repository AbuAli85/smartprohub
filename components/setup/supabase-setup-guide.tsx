"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ExternalLink } from "lucide-react"

export function SupabaseSetupGuide() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">SmartPRO - Setup Required</CardTitle>
          <CardDescription>
            Your Supabase environment variables are missing. Follow these steps to set up your project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Missing Environment Variables</AlertTitle>
            <AlertDescription>
              The application requires Supabase environment variables to function properly.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Step 1: Create a Supabase Project</h3>
            <p className="text-sm text-muted-foreground">
              If you haven't already, create a new project on{" "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Supabase.com
              </a>
              .
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Step 2: Get Your API Keys</h3>
            <p className="text-sm text-muted-foreground">
              In your Supabase project dashboard, go to Project Settings → API and copy the following values:
            </p>
            <ul className="list-disc pl-6 text-sm text-muted-foreground">
              <li>Project URL (e.g., https://abcdefghijklm.supabase.co)</li>
              <li>anon public key (starts with eyJh...)</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Step 3: Set Up Environment Variables</h3>
            <p className="text-sm text-muted-foreground">Create a .env.local file in the root of your project with:</p>
            <div className="rounded-md bg-gray-900 p-4">
              <pre className="text-sm text-white">
                <code>
                  NEXT_PUBLIC_SUPABASE_URL=your_project_url
                  <br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
                </code>
              </pre>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Step 4: Set Up Database Schema</h3>
            <p className="text-sm text-muted-foreground">
              Run the SQL setup scripts in the Supabase SQL Editor to create the necessary tables and functions.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Step 5: Restart Your Development Server</h3>
            <p className="text-sm text-muted-foreground">
              After setting up the environment variables, restart your Next.js development server.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
          <Button
            onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
            className="flex items-center gap-2"
          >
            Go to Supabase Dashboard <ExternalLink className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
