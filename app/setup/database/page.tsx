import { DatabaseSetup } from "@/components/setup/database-setup"
import { DatabaseColumnFix } from "@/components/setup/database-column-fix"
import { DatabaseRelationshipFix } from "@/components/setup/database-relationship-fix"
import { DatabaseSetupGuide } from "@/components/setup/database-setup-guide"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, ArrowDown } from "lucide-react"
import { Steps, Step } from "@/components/ui/steps"

export default function DatabaseSetupPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">Database Setup</h1>

      <Alert className="mb-8 border-amber-200 bg-amber-50">
        <Info className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-800">Important Setup Instructions</AlertTitle>
        <AlertDescription className="text-amber-700">
          <p className="mb-2">
            You must complete the database setup process in the correct order. Follow the steps below:
          </p>
          <Steps className="mb-4">
            <Step>Test database connection</Step>
            <Step>Create database tables</Step>
            <Step>Seed sample data</Step>
            <Step>Fix relationships (optional)</Step>
          </Steps>
          <p className="text-sm">
            The error "No tables found in database" indicates that you need to complete the database setup first before
            trying to fix relationships.
          </p>
        </AlertDescription>
      </Alert>

      <div className="mb-8">
        <DatabaseSetupGuide />
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-center">
            <h2 className="mb-2 text-xl font-bold text-blue-800">Step 1: Database Setup</h2>
            <p className="mb-4 text-blue-700">
              Complete this step first to create all required tables and seed initial data
            </p>
            <ArrowDown className="mx-auto h-6 w-6 text-blue-500" />
          </div>
          <DatabaseSetup />
        </div>

        <div className="space-y-8">
          <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4 text-center">
            <h2 className="mb-2 text-xl font-bold text-gray-800">Step 2: Advanced Fixes</h2>
            <p className="mb-4 text-gray-700">Only run these after completing the database setup above</p>
            <ArrowDown className="mx-auto h-6 w-6 text-gray-500" />
          </div>
          <DatabaseColumnFix />
          <DatabaseRelationshipFix />
        </div>
      </div>
    </div>
  )
}
