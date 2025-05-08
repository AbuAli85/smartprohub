"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, FileText, Copy, Download, Database, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function EnvFileCreator() {
  const [databaseUrl, setDatabaseUrl] = useState("")
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("")
  const [envFileContent, setEnvFileContent] = useState("")
  const { toast } = useToast()

  // Load saved values from local storage
  useEffect(() => {
    const savedDbUrl = localStorage.getItem("databaseUrl")
    const savedSupabaseUrl = localStorage.getItem("supabaseUrl")
    const savedSupabaseKey = localStorage.getItem("supabaseAnonKey")

    if (savedDbUrl) setDatabaseUrl(savedDbUrl)
    if (savedSupabaseUrl) setSupabaseUrl(savedSupabaseUrl)
    if (savedSupabaseKey) setSupabaseAnonKey(savedSupabaseKey)

    generateEnvContent(savedDbUrl || "", savedSupabaseUrl || "", savedSupabaseKey || "")
  }, [])

  const generateEnvContent = (dbUrl: string, sbUrl: string, sbKey: string) => {
    const content = `# Database URLs
DATABASE_URL="${dbUrl}"
POSTGRES_URL="${dbUrl}"
NEON_DATABASE_URL="${dbUrl}"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="${sbUrl}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${sbKey}"

# Add any other environment variables your application needs below
`
    setEnvFileContent(content)
  }

  const handleDatabaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setDatabaseUrl(url)
    localStorage.setItem("databaseUrl", url)
    generateEnvContent(url, supabaseUrl, supabaseAnonKey)
  }

  const handleSupabaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setSupabaseUrl(url)
    localStorage.setItem("supabaseUrl", url)
    generateEnvContent(databaseUrl, url, supabaseAnonKey)
  }

  const handleSupabaseKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value
    setSupabaseAnonKey(key)
    localStorage.setItem("supabaseAnonKey", key)
    generateEnvContent(databaseUrl, supabaseUrl, key)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envFileContent)
    toast({
      title: "Copied to clipboard",
      description: "The .env.local file content has been copied to your clipboard.",
    })
  }

  const downloadEnvFile = () => {
    const element = document.createElement("a")
    const file = new Blob([envFileContent], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = ".env.local"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "File downloaded",
      description: "Place the .env.local file in your project root directory.",
    })
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Create .env.local File
        </CardTitle>
        <CardDescription>Generate a .env.local file with all required environment variables</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="create">
          <TabsList className="mb-4">
            <TabsTrigger value="create">Create File</TabsTrigger>
            <TabsTrigger value="supabase">Supabase Guide</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <div className="space-y-6">
              <div className="space-y-4 border-b pb-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Database Configuration</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="database-url">Neon PostgreSQL URL</Label>
                  <Input
                    id="database-url"
                    placeholder="postgres://username:password@hostname:port/database"
                    value={databaseUrl}
                    onChange={handleDatabaseUrlChange}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your Neon PostgreSQL connection string from your Neon dashboard.
                  </p>
                </div>
              </div>

              <div className="space-y-4 border-b pb-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Supabase Configuration</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supabase-url">Supabase URL</Label>
                  <Input
                    id="supabase-url"
                    placeholder="https://your-project-id.supabase.co"
                    value={supabaseUrl}
                    onChange={handleSupabaseUrlChange}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supabase-anon-key">Supabase Anon Key</Label>
                  <Input
                    id="supabase-anon-key"
                    placeholder="your-supabase-anon-key"
                    value={supabaseAnonKey}
                    onChange={handleSupabaseKeyChange}
                    className="font-mono text-sm"
                    type="password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Find these values in your Supabase project dashboard under Project Settings → API.
                  </p>
                </div>
              </div>

              {envFileContent && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Generated .env.local File Content</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadEnvFile}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <pre className="p-4 bg-slate-100 rounded-md text-xs overflow-auto max-h-60 whitespace-pre-wrap">
                    {envFileContent}
                  </pre>
                </div>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Place the .env.local file in the root directory of your project. You'll need to restart your
                  development server for the changes to take effect.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="supabase">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">How to Find Your Supabase Credentials</h3>

              <ol className="list-decimal list-inside space-y-4 text-sm">
                <li>
                  <p className="mb-1">
                    Log in to your Supabase dashboard at{" "}
                    <a
                      href="https://app.supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      https://app.supabase.com
                    </a>
                  </p>
                </li>

                <li>
                  <p className="mb-1">Select your project from the dashboard</p>
                </li>

                <li>
                  <p className="mb-1">
                    In the left sidebar, click on <strong>Project Settings</strong>
                  </p>
                </li>

                <li>
                  <p className="mb-1">
                    Click on <strong>API</strong> in the settings menu
                  </p>
                  <div className="ml-6 mt-2 p-3 bg-slate-100 rounded-md">
                    <p className="font-medium mb-1">You'll find:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>Project URL</strong>: This is your{" "}
                        <code className="bg-slate-200 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code>
                      </li>
                      <li>
                        <strong>anon/public</strong> key: This is your{" "}
                        <code className="bg-slate-200 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                      </li>
                    </ul>
                  </div>
                </li>

                <li>
                  <p className="mb-1">Copy these values and paste them into the form on the "Create File" tab</p>
                </li>
              </ol>

              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Security Note</AlertTitle>
                <AlertDescription>
                  The anon key is safe to use in browser environments as it has limited permissions. However, never
                  expose your service_role key in client-side code.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="instructions">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">How to Use the .env.local File</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Enter your database and Supabase credentials on the "Create File" tab</li>
                  <li>Download the generated .env.local file or copy its contents</li>
                  <li>Place the .env.local file in the root directory of your project (same level as package.json)</li>
                  <li>Restart your development server (stop and restart next dev)</li>
                  <li>Your application should now be able to connect to both databases</li>
                </ol>
              </div>

              <div>
                <h3 className="font-medium mb-2">For Production Deployment</h3>
                <p className="text-sm mb-2">
                  For production environments (like Vercel), you should set the environment variables in your hosting
                  platform:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to your Vercel project dashboard</li>
                  <li>Navigate to Settings → Environment Variables</li>
                  <li>Add all the variables from your .env.local file</li>
                  <li>Redeploy your application</li>
                </ol>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Best Practice</AlertTitle>
                <AlertDescription>
                  Never commit your .env.local file to version control. It contains sensitive information that should be
                  kept private.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          After creating the .env.local file, restart your development server for changes to take effect.
        </p>
      </CardFooter>
    </Card>
  )
}
