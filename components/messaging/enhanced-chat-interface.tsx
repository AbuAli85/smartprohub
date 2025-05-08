"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider-direct"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Paperclip, Send, File, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

type Message = {
  id: string
  sender_id: string
  recipient_id: string
  conversation_id: string
  content: string
  attachment_url?: string
  created_at: string
  status: string
  sender_profile?: {
    full_name?: string
    avatar_url?: string
  }
}

interface EnhancedChatInterfaceProps {
  conversationId?: string
  recipientId?: string
  className?: string
}

export function EnhancedChatInterface({ conversationId, recipientId, className }: EnhancedChatInterfaceProps) {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [messageText, setMessageText] = useState("")
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch messages
  const fetchMessages = async () => {
    if (!user || !conversationId) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender_profile:profiles!sender_id(full_name, avatar_url)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
        return
      }

      setMessages(data || [])

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ status: "read", is_read: true })
        .eq("conversation_id", conversationId)
        .eq("recipient_id", user.id)
        .eq("is_read", false)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAttachment(file)

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAttachmentPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      // For non-image files, just show the file name
      setAttachmentPreview(null)
    }
  }

  // Upload attachment
  const uploadAttachment = async (): Promise<string | undefined> => {
    if (!attachment || !user) return

    try {
      // Create a unique file path
      const fileExt = attachment.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `attachments/${fileName}`

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("message-attachments").upload(filePath, attachment)

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data } = supabase.storage.from("message-attachments").getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading attachment:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload attachment",
        variant: "destructive",
      })
      return undefined
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!user || (!messageText.trim() && !attachment)) return
    if (!conversationId && !recipientId) return

    try {
      setIsSending(true)

      let attachmentUrl: string | undefined

      // Upload attachment if present
      if (attachment) {
        attachmentUrl = await uploadAttachment()
      }

      // If no conversation ID, create a new conversation
      let actualConversationId = conversationId
      if (!actualConversationId) {
        // Create new conversation
        const { data: convData, error: convError } = await supabase.from("conversations").insert({}).select().single()

        if (convError) {
          throw convError
        }

        actualConversationId = convData.id

        // Add participants
        await supabase.from("conversation_participants").insert([
          { conversation_id: actualConversationId, user_id: user.id },
          { conversation_id: actualConversationId, user_id: recipientId },
        ])
      }

      // Create temporary message for optimistic UI
      const tempId = `temp-${Date.now()}`
      const tempMessage: Message = {
        id: tempId,
        sender_id: user.id,
        recipient_id: recipientId || "",
        conversation_id: actualConversationId,
        content: messageText,
        attachment_url: attachmentUrl,
        created_at: new Date().toISOString(),
        status: "sending",
        sender_profile: {
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
        },
      }

      // Add to local state
      setMessages((prev) => [...prev, tempMessage])

      // Send to server
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          conversation_id: actualConversationId,
          content: messageText,
          attachment_url: attachmentUrl,
          status: "sent",
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Update local state with server response
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? { ...data, sender_profile: tempMessage.sender_profile } : msg)),
      )

      // Update conversation's last message
      await supabase
        .from("conversations")
        .update({
          last_message: messageText,
          last_message_time: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", actualConversationId)

      // Reset form
      setMessageText("")
      setAttachment(null)
      setAttachmentPreview(null)
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })

      // Remove temporary message
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp-")))
    } finally {
      setIsSending(false)
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return

    // Subscribe to new messages
    const channel = supabase
      .channel("messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async (payload) => {
        const newMessage = payload.new as Message

        // Only process if it's for the current conversation
        if (
          newMessage.conversation_id === conversationId ||
          newMessage.recipient_id === user.id ||
          newMessage.sender_id === user.id
        ) {
          // Get sender profile
          if (newMessage.sender_id !== user.id) {
            const { data } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("id", newMessage.sender_id)
              .single()

            newMessage.sender_profile = data
          }

          // Add to messages
          setMessages((prev) => [...prev, newMessage])

          // Mark as read if recipient
          if (newMessage.recipient_id === user.id) {
            await supabase.from("messages").update({ status: "read", is_read: true }).eq("id", newMessage.id)
          }
        }
      })
      .subscribe()

    // Fetch initial messages
    if (conversationId) {
      fetchMessages()
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, conversationId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Get initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "h:mm a")
    } catch (e) {
      return ""
    }
  }

  // Render message status indicator
  const renderMessageStatus = (message: Message) => {
    if (message.sender_id !== user?.id) return null

    switch (message.status) {
      case "sending":
        return <span className="text-xs text-muted-foreground">Sending...</span>
      case "sent":
        return <span className="text-xs text-muted-foreground">Sent</span>
      case "delivered":
        return <span className="text-xs text-muted-foreground">Delivered</span>
      case "read":
        return <span className="text-xs text-blue-500">Read</span>
      default:
        return null
    }
  }

  // Render attachment preview
  const renderAttachmentPreview = () => {
    if (!attachment) return null

    return (
      <div className="relative inline-block mt-2 rounded-md overflow-hidden border">
        {attachment.type.startsWith("image/") && attachmentPreview ? (
          <div className="relative w-32 h-32">
            <img
              src={attachmentPreview || "/placeholder.svg"}
              alt="Attachment preview"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="flex items-center p-2 bg-muted">
            <File className="h-4 w-4 mr-2" />
            <span className="text-sm truncate max-w-[120px]">{attachment.name}</span>
          </div>
        )}
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 h-5 w-5"
          onClick={() => {
            setAttachment(null)
            setAttachmentPreview(null)
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  // Render message attachments
  const renderMessageAttachment = (message: Message) => {
    if (!message.attachment_url) return null

    const isImage = message.attachment_url.match(/\.(jpeg|jpg|gif|png)$/i)

    if (isImage) {
      return (
        <div className="mt-2 rounded-md overflow-hidden border max-w-xs">
          <a href={message.attachment_url} target="_blank" rel="noopener noreferrer">
            <img src={message.attachment_url || "/placeholder.svg"} alt="Attachment" className="max-w-full h-auto" />
          </a>
        </div>
      )
    }

    return (
      <div className="mt-2">
        <a
          href={message.attachment_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center p-2 bg-muted rounded-md hover:bg-muted/80"
        >
          <File className="h-4 w-4 mr-2" />
          <span className="text-sm">Attachment</span>
        </a>
      </div>
    )
  }

  if (!user) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <p>Please sign in to use the chat.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full flex flex-col h-[600px]", className)}>
      <CardHeader className="px-4 py-3">
        <CardTitle>Messages</CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isCurrentUser = message.sender_id === user.id

                return (
                  <div key={message.id} className={cn("flex", isCurrentUser ? "justify-end" : "justify-start")}>
                    <div className="flex items-start max-w-[80%]">
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={message.sender_profile?.avatar_url || ""} />
                          <AvatarFallback>{getInitials(message.sender_profile?.full_name)}</AvatarFallback>
                        </Avatar>
                      )}

                      <div>
                        <div
                          className={cn(
                            "rounded-lg px-3 py-2 text-sm",
                            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted",
                          )}
                        >
                          {message.content}
                          {renderMessageAttachment(message)}
                        </div>

                        <div className="flex mt-1 text-xs text-muted-foreground">
                          <span>{formatMessageTime(message.created_at)}</span>
                          <span className="ml-2">{renderMessageStatus(message)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-3 border-t">
        {renderAttachmentPreview()}

        <div className="flex items-end w-full gap-2">
          <Textarea
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="min-h-10 flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
          />

          <div className="flex gap-1">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />

            <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
              <Paperclip className="h-4 w-4" />
            </Button>

            <Button onClick={sendMessage} disabled={(!messageText.trim() && !attachment) || isSending}>
              {isSending ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
