"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRealtimeMessaging, type Message } from "@/hooks/use-realtime-messaging"
import { useAuth } from "@/components/auth/auth-provider"
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

interface EnhancedChatInterfaceProps {
  conversationId?: string
  recipientId?: string
  className?: string
}

export function EnhancedChatInterface({ conversationId, recipientId, className }: EnhancedChatInterfaceProps) {
  const { user, profile } = useAuth()
  const { messages, sendMessage, isLoading, isSending } = useRealtimeMessaging(conversationId)
  const [messageText, setMessageText] = useState("")
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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

  // Handle file upload
  const uploadAttachment = async (): Promise<string | undefined> => {
    if (!attachment || !user) return

    try {
      setIsUploading(true)

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
    } finally {
      setIsUploading(false)
    }
  }

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!user || (!messageText.trim() && !attachment)) return

    try {
      let attachmentUrl: string | undefined

      // Upload attachment if present
      if (attachment) {
        attachmentUrl = await uploadAttachment()
      }

      // Send the message
      if (recipientId) {
        await sendMessage(recipientId, messageText, conversationId, attachmentUrl)
        setMessageText("")
        setAttachment(null)
        setAttachmentPreview(null)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    }
  }

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
                handleSendMessage()
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

            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || isUploading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Button
              onClick={handleSendMessage}
              disabled={(!messageText.trim() && !attachment) || isSending || isUploading}
            >
              {isSending || isUploading ? (
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
