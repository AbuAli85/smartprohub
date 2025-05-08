import { SystemCheck } from "@/components/debug/system-check"

export default function SystemCheckPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">System Health Check</h1>
      <p className="text-gray-600 mb-6">
        Verify that all components of your SmartPRO Business Services Hub are working correctly
      </p>
      <SystemCheck />

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Additional Testing Tools</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium mb-2">Cross-Role Testing</h3>
            <p className="text-gray-600 mb-4">
              Test if role-based access control is working correctly by attempting to access resources meant for
              different user roles.
            </p>
            <a
              href="/debug/role-test"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Run Role Tests
            </a>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium mb-2">Database Operations Testing</h3>
            <p className="text-gray-600 mb-4">
              Test basic CRUD operations against the database to ensure everything is working correctly.
            </p>
            <a
              href="/debug/db-test"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Run Database Tests
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
