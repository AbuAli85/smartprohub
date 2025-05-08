import { NotificationsSetup } from "@/components/setup/notifications-setup"

export const metadata = {
  title: "Set Up Notifications - SmartPRO",
  description: "Configure the notification system for SmartPRO Business Services Hub",
}

export default function NotificationsSetupPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Notification System Setup</h1>

      <div className="max-w-2xl mx-auto">
        <NotificationsSetup />
      </div>
    </div>
  )
}
