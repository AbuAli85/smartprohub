"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Send, User, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"

type Contact = {
  id: string
  full_name: string
  avatar_url?: string
  role: string
  last_message?: string
  last_message_time?: string
  unread_count?: number
}

type Message = {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  read: boolean
  sender?: {
    full_name: string
    avatar_url?: string
  }
}

export default function ChatInterface() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [realtimeSubscribed, setRealtimeSubscribed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Fetch user and contacts on component mount
  useEffect(() => {
    fetchCurrentUser()

    // Set up realtime subscription
    if (!realtimeSubscribed) {
      const messagesSubscription = supabase
        .channel("messages-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            console.log("Realtime messages update:", payload)
            if (selectedContact) {
              fetchMessages(selectedContact.id)
            }
            fetchContacts()
          },
        )
        .subscribe()

      setRealtimeSubscribed(true)

      // Cleanup subscription on unmount
      return () => {
        messagesSubscription.unsubscribe()
      }
    }
  }, [realtimeSubscribed])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mark messages as read when contact is selected
  useEffect(() => {
    if (selectedContact && currentUserId) {
      markMessagesAsRead(selectedContact.id, currentUserId)
    }
  }, [selectedContact, currentUserId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchCurrentUser = async () => {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError

      if (!user) {
        throw new Error("User not authenticated")
      }

      setCurrentUserId(user.id)

      // Fetch contacts after getting user
      fetchContacts()
    } catch (error: any) {
      console.error("Error fetching current user:", error)
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const fetchContacts = async () => {
    if (!currentUserId) return

    try {
      setLoading(true)

      // Get user role
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUserId)
        .single()

      if (profileError) throw profileError

      const userRole = profileData.role

      let contactsQuery

      if (userRole === "client") {
        // Clients see providers
        contactsQuery = supabase.from("profiles").select("id, full_name, avatar_url, role").eq("role", "provider")
      } else if (userRole === "provider") {
        // Providers see clients
        contactsQuery = supabase.from("profiles").select("id, full_name, avatar_url, role").eq("role", "client")
      } else {
        // Admins see everyone
        contactsQuery = supabase.from("profiles").select("id, full_name, avatar_url, role").neq("id", currentUserId)
      }

      const { data: contactsData, error: contactsError } = await contactsQuery

      if (contactsError) throw contactsError

      // Get last messages and unread counts for each contact
      const contactsWithMetadata = await Promise.all(
        (contactsData || []).map(async (contact) => {
          // Get last message
          const { data: lastMessageData } = await supabase
            .from("messages")
            .select(`
              content,
              created_at
            `)
            .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
            .or(`sender_id.eq.${contact.id},recipient_id.eq.${contact.id}`)
            .order("created_at", { ascending: false })
            .limit(1)

          // Get unread count
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("id", { count: "exact", head: false })
            .eq("recipient_id", currentUserId)
            .eq("sender_id", contact.id)
            .eq("read", false)

          return {
            ...contact,
            last_message: lastMessageData?.[0]?.content,
            last_message_time: lastMessageData?.[0]?.created_at,
            unread_count: unreadCount || 0,
          }
        }),
      )

      // Sort contacts by last message time (most recent first)
      const sortedContacts = contactsWithMetadata.sort((a, b) => {
        if (!a.last_message_time) return 1
        if (!b.last_message_time) return -1
        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      })

      setContacts(sortedContacts)

      // If no contact is selected and we have contacts, select the first one
      if (!selectedContact && sortedContacts.length > 0) {
        setSelectedContact(sortedContacts[0])
        fetchMessages(sortedContacts[0].id)
      }
    } catch (error: any) {
      console.error("Error fetching contacts:", error)
      toast({
        title: "Error fetching contacts",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (contactId: string) => {
    if (!currentUserId) return

    try {
      setLoading(true)

      // Fetch messages between current user and selected contact
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:sender_id (
            full_name,
            avatar_url
          )
        `)
        .or(
          `and(sender_id.eq.${currentUserId},recipient_id.eq.${contactId}),and(sender_id.eq.${contactId},recipient_id.eq.${currentUserId})`,
        )
        .order("created_at", { ascending: true })

      if (error) throw error

      setMessages(data || [])
    } catch (error: any) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error fetching messages",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markMessagesAsRead = async (senderId: string, recipientId: string) => {
    try {
      // Mark all messages from sender to recipient as read
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .eq("sender_id", senderId)
        .eq("recipient_id", recipientId)
        .eq("read", false)

      if (error) throw error
    } catch (error: any) {
      console.error("Error marking messages as read:", error)
    }
  }

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact)
    fetchMessages(contact.id)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || !currentUserId) return

    try {
      setSendingMessage(true)

      // Create new message
      const { error } = await supabase.from("messages").insert({
        sender_id: currentUserId,
        recipient_id: selectedContact.id,
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
        read: false,
      })

      if (error) throw error

      // Clear input
      setNewMessage("")

      // Refresh messages
      fetchMessages(selectedContact.id)
    } catch (error: any) {
      console.error("Error sending message:", error)
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return format(date, "h:mm a")
    } else {
      return format(date, "MMM d, h:mm a")
    }
  }

  const filteredContacts = contacts.filter((contact) =>
    contact.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-md border">
      {/* Contacts sidebar */}
      <div className="w-1/3 border-r">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search contacts..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-16rem)]">
          {loading && contacts.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <User className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium">No contacts found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? "Try a different search term" : "You don't have any contacts yet"}
              </p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${
                  selectedContact?.id === contact.id ? "bg-muted" : ""
                }`}
                onClick={() => handleContactSelect(contact)}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={contact.avatar_url || ""} />
                    <AvatarFallback>{contact.full_name[0]}</AvatarFallback>
                  </Avatar>
                  {contact.unread_count ? (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      {contact.unread_count}
                    </span>
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate">{contact.full_name}</h3>
                    {contact.last_message_time && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(contact.last_message_time), "MMM d")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {contact.last_message || `${contact.role.charAt(0).toUpperCase() + contact.role.slice(1)}`}
                  </p>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedContact.avatar_url || ""} />
                <AvatarFallback>{selectedContact.full_name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{selectedContact.full_name}</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedContact.role.charAt(0).toUpperCase() + selectedContact.role.slice(1)}
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {loading ? (
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
                  {messages.map((message) => {
                    const isCurrentUser = message.sender_id === currentUserId

                    return (
                      <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                        <div className="flex gap-2 max-w-[80%]">
                          {!isCurrentUser && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={message.sender?.avatar_url || ""} />
                              <AvatarFallback>{message.sender?.full_name[0] || "U"}</AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <div
                              className={`rounded-lg p-3 ${
                                isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatMessageTime(message.created_at)}
                            </p>
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
              <div className="flex gap-2">
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
                  disabled={!newMessage.trim() || sendingMessage}
                  onClick={handleSendMessage}
                >
                  {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <User className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">Select a contact</h3>
            <p className="text-muted-foreground mt-1">Choose a contact from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}
