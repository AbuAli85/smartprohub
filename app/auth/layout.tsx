import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  // We'll remove this layout since we're handling the layout directly in the AuthForm component
  return <>{children}</>
}
