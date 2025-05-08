import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProviderDirect } from "@/components/auth/auth-provider-direct"

export const metadata: Metadata = {
  title: "SmartPRO – Business Services Hub",
  description: "A comprehensive platform for business service providers and clients",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProviderDirect>
            {children}
            <Toaster />
          </AuthProviderDirect>
        </ThemeProvider>
      </body>
    </html>
  )
}
