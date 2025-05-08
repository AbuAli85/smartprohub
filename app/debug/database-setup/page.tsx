"use client"

import dynamic from "next/dynamic"

// Dynamically import the component with no SSR
const DatabaseConnectionSetup = dynamic(
  () => import("@/components/debug/database-connection-setup").then((mod) => mod.DatabaseConnectionSetup),
  { ssr: false },
)

export default function DatabaseSetupPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Database Connection Setup</h1>
      <DatabaseConnectionSetup />
    </div>
  )
}
