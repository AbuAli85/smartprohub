"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { AuthStatusDisplay } from "@/components/auth/auth-status-display"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function AuthTestWrapper() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Auth Status</TabsTrigger>
          <TabsTrigger value="links">Test Links</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="mt-4">
          <AuthStatusDisplay />
        </TabsContent>

        <TabsContent value="links" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Test Links</CardTitle>
              <CardDescription>Use these links to test different authentication flows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/auth/login" className="block">
                  <Button variant="outline" className="w-full">
                    Login Page
                  </Button>
                </Link>
                <Link href="/auth/register" className="block">
                  <Button variant="outline" className="w-full">
                    Register Page
                  </Button>
                </Link>
                <Link href="/auth/debug" className="block">
                  <Button variant="outline" className="w-full">
                    Auth Debug
                  </Button>
                </Link>
                <Link href="/auth/troubleshoot" className="block">
                  <Button variant="outline" className="w-full">
                    Auth Troubleshoot
                  </Button>
                </Link>
                <Link href="/dashboard" className="block">
                  <Button variant="outline" className="w-full">
                    Dashboard (Protected)
                  </Button>
                </Link>
                <Link href="/profile-setup" className="block">
                  <Button variant="outline" className="w-full">
                    Profile Setup
                  </Button>
                </Link>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                These links will help you test the authentication flow and protected routes.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Help</CardTitle>
              <CardDescription>Troubleshooting tips for common authentication issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Session Not Persisting</h3>
                <p className="text-sm text-muted-foreground">
                  If your session is not persisting between page refreshes, check that cookies are enabled in your
                  browser.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Login Redirects</h3>
                <p className="text-sm text-muted-foreground">
                  After login, you should be redirected to your dashboard or the page you were trying to access. If this
                  is not happening, there might be an issue with the redirect logic.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Role-Based Access</h3>
                <p className="text-sm text-muted-foreground">
                  Different user roles (admin, provider, client) have access to different areas of the application. Make
                  sure your user profile has the correct role assigned.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                If you continue to experience issues, please contact support.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
