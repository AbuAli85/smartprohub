"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRealtimeMessaging } from "@/hooks/use-realtime-messaging"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase/client"
import { format, isToday, isYesterday } from "date-fns"
import {
  Search,
  Send,
  User,
  Loader2,
  PaperclipIcon,
  ImageIcon,
  FileIcon,
  CheckIcon,
  CheckCheckIcon,
  Clock,
  AlertCircle,
  X,
  Plus,
  MessageSquare,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export default function EnhancedChatInterface() {
  const { user, profile } = useAuth()
  const {
    messages,
    conversations,
    isLoading,
    activeConversation,
    setActiveConversation,
    sendMessage,
    createConversation,
    unreadCounts,
    refreshConversations,
  } = useRealtimeMessaging()

  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [attachment, setAttachment] = useState<File | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [newConversationOpen, setNewConversationOpen] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [initialMessage, setInitialMessage] = useState("")
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Fetch available users for new conversations
  const fetchAvailableUsers = async () => {
    if (!user?.id) return

    try {
      setIsLoadingUsers(true)

      // Get user role to determine who they can message
      const { data: userData } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      const userRole = userData?.role

      let query = supabase.from("profiles").select("id, full_name, avatar_url, role, email").neq("id", user.id)

      // Filter by role based on current user's role
      if (userRole === "client") {
        // Clients can message providers and admins
        query = query.in("role", ["provider", "admin"])
      } else if (userRole === "provider") {
        // Providers can message clients and admins
        query = query.in("role", ["client", "admin"])
      }
      // Admins can message everyone, so no additional filter

      // Apply search filter if provided
      if (userSearchQuery) {
        query = query.ilike("full_name", `%${userSearchQuery}%`)
      }

      const { data, error } = await query.order("full_name")

      if (error) throw error

      setAvailableUsers(data || [])
    } catch (error) {
      console.error("Error fetching available users:", error)
      toast({
        title: "Error",
        description: "Failed to load available users",
        variant: "destructive",
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachment) return

    try {
      setIsSending(true)
      await sendMessage(newMessage, attachment || undefined)
      setNewMessage("")
      setAttachment(null)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        })
        return
      }

      setAttachment(file)
    }
  }

  // Handle creating a new conversation
  const handleCreateConversation = async () => {
    if (!selectedUser) {
      toast({
        title: "Select a user",
        description: "Please select a user to start a conversation with",
        variant: "destructive",
      })
      return
    }

    if (!initialMessage.trim()) {
      toast({
        title: "Enter a message",
        description: "Please enter an initial message",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSending(true)
      const conversation = await createConversation(selectedUser.id, initialMessage)

      if (conversation) {
        setNewConversationOpen(false)
        setSelectedUser(null)
        setInitialMessage("")

        // Refresh conversations to ensure we have the latest data
        refreshConversations()
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    } finally {
      setIsSending(false)
    }
  }

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)

    if (isToday(date)) {
      return format(date, "h:mm a")
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, "h:mm a")}`
    } else {
      return format(date, "MMM d, h:mm a")
    }
  }

  // Get status icon based on message status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sending":
        return <Clock className="h-3 w-3 text-muted-foreground" />
      case "sent":
        return <CheckIcon className="h-3 w-3 text-muted-foreground" />
      case "delivered":
        return <CheckIcon className="h-3 w-3 text-muted-foreground" />
      case "read":
        return <CheckCheckIcon className="h-3 w-3 text-blue-500" />
      case "error":
        return <AlertCircle className="h-3 w-3 text-destructive" />
      default:
        return null
    }
  }

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) =>
    conversation.otherParticipant?.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Render attachment preview
  const renderAttachmentPreview = () => {
    if (!attachment) return null

    const isImage = attachment.type.startsWith("image/")

    return (
      <div className="relative mt-2 rounded-md border p-2 bg-muted/50">
        <div className="flex items-center gap-2">
          {isImage ? (
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm truncate flex-1">{attachment.name}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAttachment(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Render attachment in message
  const renderMessageAttachment = (message: any) => {
    if (!message.attachment_url) return null

    const isImage = message.attachment_type?.startsWith("image/")

    if (isImage) {
      return (
        <div className="mt-2 rounded-md overflow-hidden">
          <img
            src={message.attachment_url || "/placeholder.svg"}
            alt="Attachment"
            className="max-w-full max-h-[300px] object-contain"
          />
        </div>
      )
    }

    return (
      <a
        href={message.attachment_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center gap-2 p-2 rounded-md border bg-muted/50 hover:bg-muted"
      >
        <FileIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm truncate">{message.attachment_name || "Attachment"}</span>
      </a>
    )
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-md border">
      {/* Conversations sidebar */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Dialog open={newConversationOpen} onOpenChange={setNewConversationOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1" onClick={() => fetchAvailableUsers()}>
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select a user</Label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search users..."
                        className="pl-8"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            fetchAvailableUsers()
                          }
                        }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchAvailableUsers}
                      disabled={isLoadingUsers}
                      className="w-full mt-1"
                    >
                      {isLoadingUsers ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </div>

                  <div className="max-h-[200px] overflow-y-auto border rounded-md">
                    {isLoadingUsers ? (
                      <div className="flex justify-center items-center h-[100px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : availableUsers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[100px] p-4 text-center">
                        <User className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {userSearchQuery ? "No users found" : "Search for users to message"}
                        </p>
                      </div>
                    ) : (
                      <div className="p-1">
                        {availableUsers.map((user) => (
                          <div
                            key={user.id}
                            className={cn(
                              "flex items-center gap-3 p-2 cursor-pointer rounded-md hover:bg-muted transition-colors",
                              selectedUser?.id === user.id ? "bg-muted" : "",
                            )}
                            onClick={() => setSelectedUser(user)}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url || ""} />
                              <AvatarFallback>{user.full_name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{user.full_name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Initial message</Label>
                    <Textarea
                      placeholder="Type your first message..."
                      value={initialMessage}
                      onChange={(e) => setInitialMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewConversationOpen(false)
                      setSelectedUser(null)
                      setInitialMessage("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateConversation}
                    disabled={isSending || !selectedUser || !initialMessage.trim()}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      "Start Conversation"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search conversations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {isLoading && conversations.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium">No conversations found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? "Try a different search term" : "Start a new conversation"}
              </p>
              {!searchQuery && (
                <Button
                  className="mt-4"
                  onClick={() => {
                    setNewConversationOpen(true)
                    fetchAvailableUsers()
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Conversation
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted",
                    activeConversation?.id === conversation.id ? "bg-muted" : "",
                  )}
                  onClick={() => setActiveConversation(conversation)}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage
                        src={conversation.otherParticipant?.avatar_url || ""}
                        alt={conversation.otherParticipant?.full_name || "User"}
                      />
                      <AvatarFallback>{(conversation.otherParticipant?.full_name || "U").charAt(0)}</AvatarFallback>
                    </Avatar>
                    {conversation.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium truncate">
                        {conversation.otherParticipant?.full_name || "Unknown User"}
                      </h3>
                      {conversation.last_message_time && (
                        <span className="text-xs text-muted-foreground">
                          {format(
                            new Date(conversation.last_message_time),
                            isToday(new Date(conversation.last_message_time)) ? "h:mm a" : "MMM d",
                          )}
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-xs truncate",
                        conversation.unread_count > 0 ? "font-medium text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {conversation.last_message ||
                        `${conversation.otherParticipant?.role.charAt(0).toUpperCase() + conversation.otherParticipant?.role.slice(1) || ""}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={activeConversation.otherParticipant?.avatar_url || ""} />
                  <AvatarFallback>{activeConversation.otherParticipant?.full_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{activeConversation.otherParticipant?.full_name || "Unknown User"}</h3>
                  <p className="text-xs text-muted-foreground">
                    {activeConversation.otherParticipant?.role.charAt(0).toUpperCase() +
                      activeConversation.otherParticipant?.role.slice(1) || ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Search in conversation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <h3 className="font-medium">No messages yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">Send a message to start the conversation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isCurrentUser = message.sender_id === user?.id
                    const showDateSeparator =
                      index === 0 ||
                      new Date(message.created_at).toDateString() !==
                        new Date(messages[index - 1].created_at).toDateString()

                    return (
                      <div key={message.id}>
                        {showDateSeparator && (
                          <div className="flex justify-center my-4">
                            <Badge variant="outline" className="bg-background">
                              {isToday(new Date(message.created_at))
                                ? "Today"
                                : isYesterday(new Date(message.created_at))
                                  ? "Yesterday"
                                  : format(new Date(message.created_at), "MMMM d, yyyy")}
                            </Badge>
                          </div>
                        )}
                        <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                          <div className="flex gap-2 max-w-[80%]">
                            {!isCurrentUser && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={message.sender?.avatar_url || ""} />
                                <AvatarFallback>{message.sender?.full_name?.[0] || "U"}</AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <div
                                className={cn(
                                  "rounded-lg p-3",
                                  isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted",
                                )}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                {renderMessageAttachment(message)}
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground justify-end">
                                <span>{formatMessageTime(message.created_at)}</span>
                                {isCurrentUser && getStatusIcon(message.status)}
                              </div>
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

            <div className="p-4 border-t">
              {renderAttachmentPreview()}
              <div className="flex gap-2 mt-2">
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending}
                >
                  <PaperclipIcon className="h-4 w-4" />
                </Button>
                <Textarea
                  placeholder="Type a message..."
                  className="min-h-[80px]"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button
                  className="self-end"
                  disabled={(!newMessage.trim() && !attachment) || isSending}
                  onClick={handleSendMessage}
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">Select a conversation</h3>
            <p className="text-muted-foreground mt-1">Choose a conversation from the list to start messaging</p>
            <Button
              className="mt-4"
              onClick={() => {
                setNewConversationOpen(true)
                fetchAvailableUsers()
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Conversation
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
