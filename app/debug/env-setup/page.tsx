import { EnvFileCreator } from "@/components/debug/env-file-creator"

export const metadata = {
  title: "Environment Setup - SmartPRO",
  description: "Set up environment variables for your SmartPRO Business Services Hub",
}

export default function EnvSetupPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Environment Variables Setup</h1>
      <EnvFileCreator />
    </div>
  )
}
