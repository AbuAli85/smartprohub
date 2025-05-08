import { Suspense } from "react"
import { EnhancedChatInterface } from "@/components/messaging/enhanced-chat-interface"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Messages - SmartPRO",
  description: "Messaging interface for SmartPRO Business Services Hub",
}

export default function MessagesPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      <div className="grid grid-cols-1 gap-6">
        <Suspense fallback={<div>Loading chat interface...</div>}>
          <EnhancedChatInterface />
        </Suspense>

        <Card>
          <CardHeader>
            <CardTitle>Messaging Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Use this messaging interface to communicate with clients, providers, and administrators. You can send text
              messages and attachments. All messages are encrypted and secure.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
              <li>Send messages to start new conversations</li>
              <li>Attach files by clicking the paperclip icon</li>
              <li>View message status (sending, sent, delivered, read)</li>
              <li>Receive real-time notifications for new messages</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
