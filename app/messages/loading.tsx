import { Loader2 } from "lucide-react"

export default function MessagesLoading() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-3xl font-bold">Messages</h1>
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center rounded-md border">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    </div>
  )
}
