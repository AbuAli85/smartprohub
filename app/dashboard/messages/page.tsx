"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Search } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

// Mock data for conversations
const conversations = [
  {
    id: "1",
    name: "John Doe",
    avatar: "/abstract-geometric-shapes.png?height=40&width=40&query=John Doe",
    lastMessage: "When can we schedule our next meeting?",
    timestamp: "10:30 AM",
    unread: 2,
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: "/abstract-geometric-shapes.png?height=40&width=40&query=Jane Smith",
    lastMessage: "I've sent you the contract draft for review.",
    timestamp: "Yesterday",
    unread: 0,
  },
  {
    id: "3",
    name: "Robert Johnson",
    avatar: "/abstract-geometric-shapes.png?height=40&width=40&query=Robert Johnson",
    lastMessage: "Thanks for your help with the project!",
    timestamp: "Yesterday",
    unread: 0,
  },
  {
    id: "4",
    name: "Emily Davis",
    avatar: "/abstract-geometric-shapes.png?height=40&width=40&query=Emily Davis",
    lastMessage: "Let's discuss the marketing strategy tomorrow.",
    timestamp: "Monday",
    unread: 0,
  },
  {
    id: "5",
    name: "Michael Brown",
    avatar: "/abstract-geometric-shapes.png?height=40&width=40&query=Michael Brown",
    lastMessage: "I need some advice on the legal matter we discussed.",
    timestamp: "Sunday",
    unread: 1,
  },
]

// Mock data for messages in a conversation
const messages = [
  {
    id: "1",
    sender: "John Doe",
    content: "Hi there! I wanted to discuss our upcoming project.",
    timestamp: "10:00 AM",
    isSender: false,
  },
  {
    id: "2",
    sender: "You",
    content: "Sure, what aspects of the project would you like to discuss?",
    timestamp: "10:05 AM",
    isSender: true,
  },
  {
    id: "3",
    sender: "John Doe",
    content: "I'm particularly interested in the timeline and resource allocation.",
    timestamp: "10:10 AM",
    isSender: false,
  },
  {
    id: "4",
    sender: "You",
    content:
      "I've been working on the project plan. We should be able to complete it within 6 weeks with the current team.",
    timestamp: "10:15 AM",
    isSender: true,
  },
  {
    id: "5",
    sender: "John Doe",
    content: "That sounds good. When can we schedule our next meeting to go over the details?",
    timestamp: "10:30 AM",
    isSender: false,
  },
]

export default function MessagesPage() {
  const { user } = useAuth()
  const [activeConversation, setActiveConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === "") return

    // In a real app, you would send this message to your backend
    console.log("Sending message:", newMessage)
    setNewMessage("")
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col md:flex-row md:space-x-4">
      {/* Conversations sidebar */}
      <div className="w-full border-r md:w-80">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search messages..."
              className="w-full appearance-none bg-background pl-8 shadow-none"
            />
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-13rem)]">
          <div className="space-y-2 p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`flex cursor-pointer items-center space-x-4 rounded-lg p-3 transition-colors hover:bg-accent ${
                  activeConversation.id === conversation.id ? "bg-accent" : ""
                }`}
                onClick={() => setActiveConversation(conversation)}
              >
                <Avatar>
                  <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                  <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{conversation.name}</h3>
                    <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{conversation.lastMessage}</p>
                </div>
                {conversation.unread > 0 && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {conversation.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        {/* Chat header */}
        <div className="border-b p-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={activeConversation.avatar || "/placeholder.svg"} alt={activeConversation.name} />
              <AvatarFallback>{activeConversation.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{activeConversation.name}</h3>
              <p className="text-xs text-muted-foreground">Last active: Today at 11:30 AM</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isSender ? "justify-end" : "justify-start"}`}>
                <div className="flex max-w-[80%] items-start space-x-2">
                  {!message.isSender && (
                    <Avatar className="mt-1 h-8 w-8">
                      <AvatarImage
                        src={activeConversation.avatar || "/placeholder.svg"}
                        alt={activeConversation.name}
                      />
                      <AvatarFallback>{activeConversation.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <Card className={message.isSender ? "bg-primary text-primary-foreground" : ""}>
                    <CardContent className="p-3">
                      <p className="text-sm">{message.content}</p>
                      <p className="mt-1 text-right text-xs text-muted-foreground">{message.timestamp}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
