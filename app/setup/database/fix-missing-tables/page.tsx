import { FixMissingTables } from "@/components/setup/fix-missing-tables"

export default function FixMissingTablesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">Database Tables Fix</h1>
      <p className="mb-8 text-gray-600">
        This utility will create missing database tables that are required for the application to function properly.
      </p>

      <FixMissingTables />
    </div>
  )
}
