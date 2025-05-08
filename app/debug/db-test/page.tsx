import { DatabaseOperationsTester } from "@/components/debug/database-operations-tester"

export default function DatabaseTestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Database Operations Testing</h1>
      <p className="text-gray-600 mb-6">
        This utility tests basic CRUD operations against the database to ensure everything is working correctly.
      </p>
      <DatabaseOperationsTester />
    </div>
  )
}
