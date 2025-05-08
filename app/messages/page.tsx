"use client"

import { EnhancedChatInterface } from "@/components/messaging/enhanced-chat-interface"

export default function MessagesPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <EnhancedChatInterface />
    </div>
  )
}
