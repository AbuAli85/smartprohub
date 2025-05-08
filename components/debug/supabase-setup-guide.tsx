"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import Link from "next/link"

export function SupabaseSetupGuide() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Supabase Setup Guide</CardTitle>
        <CardDescription>
          Configure Supabase for authentication and database functionality in your SmartPRO application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="setup">Setup Steps</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-4">
              <p>
                Supabase provides authentication, database, and storage services for your SmartPRO application. This
                guide will help you set up Supabase and integrate it with your project.
              </p>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Missing Configuration</AlertTitle>
                <AlertDescription>
                  Your application is currently missing the required Supabase environment variables. Follow the steps in
                  this guide to set them up.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Required Environment Variables</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>
                        <code className="bg-slate-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code>
                        <p className="text-xs text-muted-foreground ml-5">Your Supabase project URL</p>
                      </li>
                      <li>
                        <code className="bg-slate-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                        <p className="text-xs text-muted-foreground ml-5">Your Supabase anonymous API key</p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a
                          href="https://app.supabase.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary flex items-center hover:underline"
                        >
                          Supabase Dashboard
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://supabase.com/docs"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary flex items-center hover:underline"
                        >
                          Supabase Documentation
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </li>
                      <li>
                        <Link href="/debug/env-setup" className="text-primary flex items-center hover:underline">
                          Environment Setup Tool
                        </Link>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="setup">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Setting Up Supabase</h3>

              <ol className="list-decimal list-inside space-y-4">
                <li className="pb-3 border-b">
                  <p className="font-medium">Create a Supabase Project</p>
                  <div className="ml-6 mt-1 text-sm">
                    <p>
                      Go to{" "}
                      <a
                        href="https://app.supabase.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        app.supabase.com
                      </a>{" "}
                      and create a new project.
                    </p>
                    <p className="mt-1">Choose a name, password, and region for your project.</p>
                  </div>
                </li>

                <li className="pb-3 border-b">
                  <p className="font-medium">Get Your API Keys</p>
                  <div className="ml-6 mt-1 text-sm">
                    <p>In your Supabase project dashboard:</p>
                    <ol className="list-disc list-inside ml-4 mt-1">
                      <li>Go to Project Settings → API</li>
                      <li>Copy the URL under "Project URL"</li>
                      <li>Copy the key under "anon public"</li>
                    </ol>
                  </div>
                </li>

                <li className="pb-3 border-b">
                  <p className="font-medium">Set Up Environment Variables</p>
                  <div className="ml-6 mt-1 text-sm">
                    <p>
                      Use our{" "}
                      <Link href="/debug/env-setup" className="text-primary hover:underline">
                        Environment Setup Tool
                      </Link>{" "}
                      to create a .env.local file with your Supabase credentials.
                    </p>
                    <p className="mt-1">Add the following variables:</p>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>
                        <code className="bg-slate-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> = Your Project URL
                      </li>
                      <li>
                        <code className="bg-slate-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> = Your
                        anon/public key
                      </li>
                    </ul>
                  </div>
                </li>

                <li>
                  <p className="font-medium">Restart Your Development Server</p>
                  <div className="ml-6 mt-1 text-sm">
                    <p>After setting up the environment variables, restart your Next.js development server.</p>
                  </div>
                </li>
              </ol>

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Next Steps</AlertTitle>
                <AlertDescription>
                  After setting up Supabase, you'll need to configure authentication and database tables. See the
                  Authentication and Database tabs for more information.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="auth">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Setting Up Authentication</h3>

              <p className="text-sm">
                SmartPRO uses Supabase Authentication for user management. Follow these steps to set up authentication
                for your project:
              </p>

              <ol className="list-decimal list-inside space-y-4 text-sm">
                <li className="pb-3 border-b">
                  <p className="font-medium">Configure Authentication Providers</p>
                  <div className="ml-6 mt-1">
                    <p>In your Supabase dashboard:</p>
                    <ol className="list-disc list-inside ml-4 mt-1">
                      <li>Go to Authentication → Providers</li>
                      <li>Enable Email provider (enabled by default)</li>
                      <li>Optionally enable other providers like Google, GitHub, etc.</li>
                    </ol>
                  </div>
                </li>

                <li className="pb-3 border-b">
                  <p className="font-medium">Configure Email Templates</p>
                  <div className="ml-6 mt-1">
                    <p>In your Supabase dashboard:</p>
                    <ol className="list-disc list-inside ml-4 mt-1">
                      <li>Go to Authentication → Email Templates</li>
                      <li>Customize the email templates for your brand</li>
                    </ol>
                  </div>
                </li>

                <li>
                  <p className="font-medium">Set Up URL Configuration</p>
                  <div className="ml-6 mt-1">
                    <p>In your Supabase dashboard:</p>
                    <ol className="list-disc list-inside ml-4 mt-1">
                      <li>Go to Authentication → URL Configuration</li>
                      <li>Set Site URL to your application's URL (e.g., http://localhost:3000 for development)</li>
                      <li>Add any additional redirect URLs if needed</li>
                    </ol>
                  </div>
                </li>
              </ol>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Make sure your application's URL is correctly set in the URL Configuration. This is required for
                  authentication redirects to work properly.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="database">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Setting Up Database Tables</h3>

              <p className="text-sm">
                SmartPRO requires several database tables to function properly. You can set these up manually or use our
                database setup scripts.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Manual Setup</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>To manually set up your database tables:</p>
                    <ol className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Go to the SQL Editor in your Supabase dashboard</li>
                      <li>Run the SQL scripts from the database-setup.sql file</li>
                      <li>Verify that the tables were created successfully</li>
                    </ol>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Automated Setup</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>To use our automated setup tool:</p>
                    <ol className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Make sure your Supabase environment variables are set</li>
                      <li>Navigate to /setup/database in your application</li>
                      <li>Follow the instructions to set up your database tables</li>
                    </ol>
                    <div className="mt-3">
                      <Link href="/setup/database">
                        <Button size="sm">Go to Database Setup</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Database Schema</AlertTitle>
                <AlertDescription>
                  The SmartPRO application requires specific database tables and relationships. Make sure to follow the
                  setup instructions carefully to ensure all required tables are created.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button
          variant="outline"
          onClick={() => {
            const tabs = ["overview", "setup", "auth", "database"]
            const currentIndex = tabs.indexOf(activeTab)
            const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length
            setActiveTab(tabs[prevIndex])
          }}
          disabled={activeTab === "overview"}
        >
          Previous
        </Button>
        <Link href="/debug/env-setup">
          <Button>Set Up Environment Variables</Button>
        </Link>
        <Button
          variant="outline"
          onClick={() => {
            const tabs = ["overview", "setup", "auth", "database"]
            const currentIndex = tabs.indexOf(activeTab)
            const nextIndex = (currentIndex + 1) % tabs.length
            setActiveTab(tabs[nextIndex])
          }}
          disabled={activeTab === "database"}
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  )
}
