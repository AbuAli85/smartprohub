import { DashboardSettings } from "@/components/dashboard/dashboard-settings"
import { DataExport } from "@/components/dashboard/data-export"

export default function DashboardSettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Settings</h1>
      <p className="text-muted-foreground">Customize your dashboard experience and export your data</p>

      <div className="grid gap-6 md:grid-cols-2">
        <DashboardSettings />
        <DataExport />
      </div>
    </div>
  )
}
