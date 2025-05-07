import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { SupabaseSetupGuide } from "@/components/setup/supabase-setup-guide"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SmartPRO - Business Services Hub",
  description: "A comprehensive platform for managing business services",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if Supabase is configured
  const supabaseConfigured = isSupabaseConfigured()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {supabaseConfigured ? <AuthProvider>{children}</AuthProvider> : <SupabaseSetupGuide />}
        </ThemeProvider>
      </body>
    </html>
  )
}
