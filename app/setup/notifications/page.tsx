import { NotificationsSetup } from "@/components/setup/notifications-setup"

export default function NotificationsSetupPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-3xl font-bold">Notifications Setup</h1>
      <div className="max-w-2xl mx-auto">
        <NotificationsSetup />
      </div>
    </div>
  )
}
