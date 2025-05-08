import { DirectSignIn } from "@/components/auth/direct-sign-in"

export default function DirectSignInPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold text-center mb-6">Direct Sign In</h1>
      <p className="text-center mb-8 max-w-md mx-auto">
        Use this page to sign in directly if you're experiencing issues with the normal authentication flow.
      </p>
      <DirectSignIn />
    </div>
  )
}
