import { Loader2 } from "lucide-react"

export default function NotificationsSetupLoading() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-3xl font-bold">Notifications Setup</h1>
      <div className="flex justify-center items-center h-[300px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  )
}
