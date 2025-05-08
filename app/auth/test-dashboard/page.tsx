import { AuthTestDashboard } from "@/components/debug/auth-test-dashboard"
import { DatabaseCheck } from "@/components/debug/database-check"

export default function AuthTestDashboardPage() {
  return (
    <div className="space-y-8">
      <AuthTestDashboard />
      <div className="container mx-auto px-4 pb-8">
        <DatabaseCheck />
      </div>
    </div>
  )
}
