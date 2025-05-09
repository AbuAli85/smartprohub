"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Send, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define types for better type safety
interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
}

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  read: boolean
}

interface Conversation {
  id: string
  otherUserId: string
  otherUserName: string
  otherUserAvatar: string | null
  lastMessage: string | null
  lastMessageDate: string
}

export default function ClientMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userProfiles, setUserProfiles] = useState<Record<string, Profile>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchUserAndMessages() {
      setLoading(true)
      setError(null)

      try {
        // Get current user
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session) {
          setError("No active session. Please log in.")
          setLoading(false)
          return
        }

        const currentUserId = sessionData.session.user.id
        setUserId(currentUserId)

        // Fetch direct messages only - completely avoiding conversation_participants table
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
          .order("created_at", { ascending: false })
          .limit(100)

        if (messagesError) {
          throw new Error(`Messages error: ${messagesError.message}`)
        }

        if (!messagesData || messagesData.length === 0) {
          setLoading(false)
          return // No messages, so no conversations to create
        }

        // Get unique user IDs from messages (excluding current user)
        const uniqueUserIds = new Set<string>()
        messagesData.forEach((msg) => {
          if (msg.sender_id !== currentUserId) uniqueUserIds.add(msg.sender_id)
          if (msg.recipient_id !== currentUserId) uniqueUserIds.add(msg.recipient_id)
        })

        // Convert Set to Array for the IN query
        const otherUserIds = Array.from(uniqueUserIds)

        if (otherUserIds.length === 0) {
          setLoading(false)
          return // No other users to fetch
        }

        // Fetch profiles for these users
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", otherUserIds)

        if (profilesError) {
          console.error("Profiles error:", profilesError)
          // Continue with default values if profiles can't be fetched
        }

        // Create a map of user profiles
        const profiles: Record<string, Profile> = {}
        if (profilesData) {
          profilesData.forEach((profile) => {
            profiles[profile.id] = profile
          })
        }
        setUserProfiles(profiles)

        // Create conversations from messages
        const conversationMap = new Map<string, Conversation>()

        messagesData.forEach((msg) => {
          const otherUserId = msg.sender_id === currentUserId ? msg.recipient_id : msg.sender_id

          if (!otherUserId || otherUserId === currentUserId) return

          if (!conversationMap.has(otherUserId)) {
            const profile = profiles[otherUserId] || {
              id: otherUserId,
              full_name: "Unknown User",
              avatar_url: null,
            }

            conversationMap.set(otherUserId, {
              id: `direct-${otherUserId}`, // Create a unique ID with direct- prefix
              otherUserId: otherUserId,
              otherUserName: profile.full_name || "Unknown User",
              otherUserAvatar: profile.avatar_url,
              lastMessage: msg.content,
              lastMessageDate: msg.created_at,
            })
          }
        })

        // Convert map to array and sort by date
        const conversationArray = Array.from(conversationMap.values()).sort(
          (a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime(),
        )

        setConversations(conversationArray)

        // Set active conversation if available
        if (conversationArray.length > 0) {
          setActiveConversation(conversationArray[0])
          await fetchMessages(conversationArray[0].otherUserId, currentUserId)
        }
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message || "Failed to load messages")
        toast({
          title: "Error",
          description: err.message || "Failed to load messages",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndMessages()
  }, [])

  const fetchMessages = async (otherUserId: string, currentUserId: string) => {
    try {
      // Simple direct query without any joins or complex conditions
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUserId})`,
        )
        .order("created_at", { ascending: true })
        .limit(100)

      if (error) throw error

      setMessages(data || [])
    } catch (error: any) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages: " + (error.message || "Unknown error"),
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleConversationSelect = async (conversation: Conversation) => {
    if (!userId) return

    setActiveConversation(conversation)
    await fetchMessages(conversation.otherUserId, userId)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation || !userId) return

    setSendingMessage(true)
    try {
      // Insert new message directly without using conversation_participants
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: userId,
          recipient_id: activeConversation.otherUserId,
          content: newMessage,
          read: false,
        })
        .select()

      if (error) throw error

      // Add message to state
      if (data && data[0]) {
        setMessages((prev) => [...prev, data[0]])
      }

      // Update conversation's last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversation.id
            ? {
                ...conv,
                lastMessage: newMessage,
                lastMessageDate: new Date().toISOString(),
              }
            : conv,
        ),
      )

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
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch (e) {
      return "Invalid date"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (e) {
      return "Invalid date"
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
                        <AvatarImage src={conversation.otherUserAvatar || ""} alt={conversation.otherUserName} />
                        <AvatarFallback>{conversation.otherUserName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium">{conversation.otherUserName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {conversation.lastMessage || "No messages yet"}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">{formatDate(conversation.lastMessageDate)}</div>
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
                      src={activeConversation.otherUserAvatar || ""}
                      alt={activeConversation.otherUserName}
                    />
                    <AvatarFallback>{activeConversation.otherUserName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {activeConversation.otherUserName}
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
                          className={`flex ${message.sender_id === userId ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              message.sender_id === userId ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {message.sender_id !== userId && (
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={userProfiles[message.sender_id]?.avatar_url || ""}
                                    alt={userProfiles[message.sender_id]?.full_name || "User"}
                                  />
                                  <AvatarFallback>
                                    {(userProfiles[message.sender_id]?.full_name || "U").charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <span className="text-xs font-medium">
                                {message.sender_id === userId
                                  ? "You"
                                  : userProfiles[message.sender_id]?.full_name || "Unknown User"}
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
