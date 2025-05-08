"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Send } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ClientMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConversation, setActiveConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchUserAndConversations() {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) return

        const currentUserId = session.session.user.id
        setUserId(currentUserId)

        // Fetch conversations
        const { data: conversationsData, error: conversationsError } = await supabase
          .from("conversations")
          .select(`
            *,
            participants:conversation_participants(
              user_id,
              user:profiles(id, full_name, avatar_url)
            )
          `)
          .contains("participant_ids", [currentUserId])
          .order("updated_at", { ascending: false })

        if (conversationsError) throw conversationsError

        // Process conversations to get other participants
        const processedConversations = conversationsData.map((conv: any) => {
          const otherParticipants = conv.participants.filter((p: any) => p.user_id !== currentUserId)
          return {
            ...conv,
            otherParticipants,
          }
        })

        setConversations(processedConversations)

        // Set active conversation if available
        if (processedConversations.length > 0) {
          setActiveConversation(processedConversations[0])
          await fetchMessages(processedConversations[0].id)
        }
      } catch (error: any) {
        console.error("Error fetching conversations:", error)
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndConversations()
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:sender_id(id, full_name, avatar_url)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) throw error

      setMessages(data || [])
    } catch (error: any) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    }
  }

  const handleConversationSelect = async (conversation: any) => {
    setActiveConversation(conversation)
    await fetchMessages(conversation.id)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation || !userId) return

    setSendingMessage(true)
    try {
      // Insert new message
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: activeConversation.id,
          sender_id: userId,
          content: newMessage,
          created_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      // Update conversation's updated_at
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", activeConversation.id)

      // Add message to state
      if (data && data[0]) {
        const { data: senderData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", userId)
          .single()

        const newMessageWithSender = {
          ...data[0],
          sender: senderData,
        }

        setMessages((prev) => [...prev, newMessageWithSender])
      }

      // Clear input
      setNewMessage("")
    } catch (error: any) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-3xl font-bold">Messages</h1>

      <div className="grid h-[calc(100vh-12rem)] grid-cols-1 gap-4 md:grid-cols-3">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {conversations.length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-center text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-1 p-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted ${
                        activeConversation?.id === conversation.id ? "bg-muted" : ""
                      }`}
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <Avatar>
                        <AvatarImage
                          src={conversation.otherParticipants[0]?.user?.avatar_url || ""}
                          alt={conversation.otherParticipants[0]?.user?.full_name || "User"}
                        />
                        <AvatarFallback>
                          {(conversation.otherParticipants[0]?.user?.full_name || "U").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium">
                          {conversation.otherParticipants[0]?.user?.full_name || "Unknown User"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {conversation.last_message || "No messages yet"}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">{formatDate(conversation.updated_at)}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="md:col-span-2">
          {activeConversation ? (
            <>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={activeConversation.otherParticipants[0]?.user?.avatar_url || ""}
                      alt={activeConversation.otherParticipants[0]?.user?.full_name || "User"}
                    />
                    <AvatarFallback>
                      {(activeConversation.otherParticipants[0]?.user?.full_name || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {activeConversation.otherParticipants[0]?.user?.full_name || "Unknown User"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex h-[calc(100vh-20rem)] flex-col justify-between p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex h-32 items-center justify-center">
                        <p className="text-center text-muted-foreground">No messages yet</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender.id === userId ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              message.sender.id === userId ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {message.sender.id !== userId && (
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={message.sender.avatar_url || ""}
                                    alt={message.sender.full_name || "User"}
                                  />
                                  <AvatarFallback>{(message.sender.full_name || "U").charAt(0)}</AvatarFallback>
                                </Avatar>
                              )}
                              <span className="text-xs font-medium">
                                {message.sender.id === userId ? "You" : message.sender.full_name}
                              </span>
                              <span className="text-xs opacity-70">{formatTime(message.created_at)}</span>
                            </div>
                            <p className="mt-1">{message.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      disabled={sendingMessage}
                    />
                    <Button type="submit" size="icon" disabled={sendingMessage}>
                      {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
