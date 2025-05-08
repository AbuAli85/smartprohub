import { DatabaseConnectionSetup } from "@/components/debug/database-connection-setup"

export default function DatabaseSetupPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Database Connection Setup</h1>
      <DatabaseConnectionSetup />
    </div>
  )
}
