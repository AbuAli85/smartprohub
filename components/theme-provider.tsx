"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Use suppressHydrationWarning to prevent hydration mismatch errors
  return (
    <NextThemesProvider {...props} enableSystem={true} attribute="class">
      {children}
    </NextThemesProvider>
  )
}
