"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code } from "@/components/ui/code"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { AlertCircle, CheckCircle, Copy, ExternalLink } from "lucide-react"

export function SupabaseSetupGuide() {
  const [copied, setCopied] = useState<string | null>(null)
  const isConfigured = isSupabaseConfigured()

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const envExample = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Vercel Blob for file uploads
BLOB_READ_WRITE_TOKEN=your_blob_token

# Optional: Groq for AI features
GROQ_API_KEY=your_groq_api_key`

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          {isConfigured ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <AlertCircle className="h-6 w-6 text-amber-500" />
          )}
          Supabase Configuration
        </CardTitle>
        <CardDescription>
          {isConfigured
            ? "Your Supabase configuration is working correctly."
            : "Set up your Supabase environment variables to connect to your database."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConfigured && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Required</AlertTitle>
            <AlertDescription>
              Your Supabase environment variables are missing or incorrect. Follow the steps below to set them up.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue={isConfigured ? "verify" : "setup"}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="verify">Verify</TabsTrigger>
            <TabsTrigger value="troubleshoot">Troubleshoot</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">1. Create a Supabase Project</h3>
              <p className="text-sm text-muted-foreground">
                If you haven't already, create a new project on{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  Supabase.com
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">2. Get Your API Credentials</h3>
              <p className="text-sm text-muted-foreground">
                Go to your Supabase project settings and find your API URL and anon key under "API" section.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">3. Set Up Environment Variables</h3>
              <p className="text-sm text-muted-foreground">Create a .env.local file in your project root with:</p>
              <div className="relative">
                <Code className="p-4 text-sm">{envExample}</Code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(envExample, "env")}
                >
                  {copied === "env" ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">4. Restart Your Development Server</h3>
              <p className="text-sm text-muted-foreground">
                After setting up your environment variables, restart your development server for the changes to take
                effect.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="verify" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Environment Variables Status</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <span className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_URL</span>
                  {isConfigured ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <span className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                  {isConfigured ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Connection Test</h3>
              <p className="text-sm text-muted-foreground">
                {isConfigured
                  ? "Your application is correctly configured to connect to Supabase."
                  : "Your application is not correctly configured to connect to Supabase."}
              </p>
              <Button
                variant={isConfigured ? "outline" : "default"}
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                Test Connection Again
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="troubleshoot" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Common Issues</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li className="text-sm text-muted-foreground">
                  <span className="font-medium">Missing environment variables:</span> Make sure you've created a
                  .env.local file with the correct variables.
                </li>
                <li className="text-sm text-muted-foreground">
                  <span className="font-medium">Incorrect URL format:</span> The Supabase URL should start with https://
                  and end with .supabase.co
                </li>
                <li className="text-sm text-muted-foreground">
                  <span className="font-medium">Invalid anon key:</span> The anon key should be a long string of
                  characters.
                </li>
                <li className="text-sm text-muted-foreground">
                  <span className="font-medium">Server not restarted:</span> After adding environment variables, make
                  sure to restart your development server.
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Advanced Troubleshooting</h3>
              <p className="text-sm text-muted-foreground">
                Visit the Supabase debug page to see detailed connection information:
              </p>
              <Button variant="outline" asChild>
                <a href="/debug/supabase" className="flex items-center gap-2">
                  <span>Go to Supabase Debug</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <a
            href="https://supabase.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <span>Supabase Docs</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
        <Button asChild>
          <a
            href="https://app.supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <span>Go to Supabase Dashboard</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
