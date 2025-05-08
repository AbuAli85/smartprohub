import { SessionDebug } from "@/components/auth/session-debug"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthDebugPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold text-center mb-6">Authentication Debug</h1>
      <p className="text-center mb-8 max-w-md mx-auto">Use this page to diagnose and fix authentication issues.</p>

      <div className="space-y-8">
        <SessionDebug />

        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xl font-semibold">Authentication Options</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/auth/login">Standard Login</Link>
            </Button>

            <Button asChild>
              <Link href="/auth/direct">Direct Login</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
