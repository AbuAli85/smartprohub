import { DatabaseSetup } from "@/components/setup/database-setup"

export default function DatabaseSetupPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">SmartPRO Database Setup</h1>
      <DatabaseSetup />
    </div>
  )
}
