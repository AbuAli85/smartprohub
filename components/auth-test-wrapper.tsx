"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Import the auth test component with SSR disabled
const AuthTestClient = dynamic(() => import("@/components/auth-test-client"), {
  ssr: false,
  loading: () => <p className="p-8 text-center">Loading authentication test...</p>,
})

export default function AuthTestWrapper() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading authentication test...</p>}>
      <AuthTestClient />
    </Suspense>
  )
}
