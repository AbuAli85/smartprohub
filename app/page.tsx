import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">SmartPRO</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Business Services Hub</p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/dashboard">Dashboard</Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/messages">Messages</Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/setup">Setup</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
