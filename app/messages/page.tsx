import EnhancedChatInterface from "@/components/messaging/enhanced-chat-interface"

export default function MessagesPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-3xl font-bold">Messages</h1>
      <EnhancedChatInterface />
    </div>
  )
}
