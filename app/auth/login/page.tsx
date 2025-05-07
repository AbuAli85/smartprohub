import { Suspense } from "react"
import AuthForm from "@/components/auth/auth-form" // Using default import
import { Skeleton } from "@/components/ui/skeleton"

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto">
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      }
    >
      <AuthForm type="login" />
    </Suspense>
  )
}
