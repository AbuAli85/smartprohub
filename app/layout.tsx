import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProviderDirect } from "@/components/auth/auth-provider-direct"

const inter = Inter({ subsets: ["latin"] })

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
      <body className={inter.className}>
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
