import { RoleAccessTester } from "@/components/debug/role-access-tester"

export default function RoleTestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Cross-Role Access Testing</h1>
      <p className="text-gray-600 mb-6">
        This utility tests if role-based access control is working correctly by attempting to access resources meant for
        different user roles.
      </p>
      <RoleAccessTester />
    </div>
  )
}
