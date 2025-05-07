"use client"

import { useSearchParams } from "next/navigation"
import AuthForm from "@/components/auth/auth-form"

export default function AuthFormWrapper() {
  // Use the useSearchParams hook to safely access query parameters on the client side
  const searchParams = useSearchParams()

  // Extract the parameters we need
  const error = searchParams.get("error")
  const redirectedFrom = searchParams.get("redirectedFrom")

  return <AuthForm type="login" />
}
