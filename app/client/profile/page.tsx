"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ClientProfilePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the correct profile page
    router.push("/dashboard/profile")
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Redirecting to profile page...</p>
    </div>
  )
}
