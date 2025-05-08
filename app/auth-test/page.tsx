"use client"

import { Suspense } from "react"
import AuthTestWrapper from "@/components/auth-test-wrapper"

export default function AuthTestPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading authentication test...</div>}>
      <AuthTestWrapper />
    </Suspense>
  )
}
