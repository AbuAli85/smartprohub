"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "@/components/ui/use-toast"

export type MessageStatus = "sending" | "sent" | "delivered" | "read"

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  status: MessageStatus
  is_read: boolean
  attachment_url?: string
  attachment_type?: string
  attachment_name?: string
}

export interface Conversation {
  id: string
  created_at: string
  updated_at: string
  last_message?: string
  last_message_time?: string
  participant_ids: string[]
  unread_count: number
  otherParticipant?: {
    id: string
    full_name: string
    avatar_url?: string
    role: string
  }
}

export function useRealtimeMessaging(conversationId?: string) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})

  // Fetch conversations for the current user
  const fetchConversations = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)

      const { data: conversationsData, error: conversationsError } = await supabase
        .from("conversations")
        .select(`
          *,
          participants:conversation_participants(
            user_id,
            user:profiles(id, full_name, avatar_url, role)
          )
        `)
        .contains("participant_ids", [user.id])
        .order("updated_at", { ascending: false })

      if (conversationsError) throw conversationsError

      // Process conversations to get other participants
      const processedConversations = conversationsData.map((conv: any) => {
        const otherParticipants = conv.participants.filter((p: any) => p.user_id !== user.id)
        return {
          ...conv,
          otherParticipant: otherParticipants[0]?.user || null,
          unread_count: 0, // Will be updated by the unread count query
        }
      })

      // Get unread counts for each conversation
      const unreadCountPromises = processedConversations.map(async (conv: Conversation) => {
        const { count } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: false })
          .eq("conversation_id", conv.id)
          .eq("is_read", false)
          .neq("sender_id", user.id)

        return { conversationId: conv.id, count: count || 0 }
      })

      const unreadResults = await Promise.all(unreadCountPromises)
      const unreadCountsMap: Record<string, number> = {}

      unreadResults.forEach((result) => {
        unreadCountsMap[result.conversationId] = result.count
      })

      setUnreadCounts(unreadCountsMap)

      // Update conversations with unread counts
      const conversationsWithUnread = processedConversations.map((conv: Conversation) => ({
        ...conv,
        unread_count: unreadCountsMap[conv.id] || 0,
      }))

      setConversations(conversationsWithUnread)

      // Set active conversation if conversationId is provided
      if (conversationId) {
        const active = conversationsWithUnread.find((c) => c.id === conversationId) || null
        setActiveConversation(active)
      } else if (conversationsWithUnread.length > 0 && !activeConversation) {
        setActiveConversation(conversationsWithUnread[0])
      }
    } catch (error: any) {
      console.error("Error fetching conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, conversationId, activeConversation])

  // Fetch messages for a conversation
  const fetchMessages = useCallback(
    async (convId: string) => {
      if (!user?.id) return

      try {
        setIsLoading(true)

        const { data, error } = await supabase
          .from("messages")
          .select(`
          *,
          sender:sender_id(id, full_name, avatar_url)
        `)
          .eq("conversation_id", convId)
          .order("created_at", { ascending: true })

        if (error) throw error

        setMessages(data || [])

        // Mark messages as read
        await markMessagesAsRead(convId)
      } catch (error: any) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [user?.id],
  )

  // Mark messages as read
  const markMessagesAsRead = useCallback(
    async (convId: string) => {
      if (!user?.id) return

      try {
        const { error } = await supabase
          .from("messages")
          .update({ is_read: true, status: "read" })
          .eq("conversation_id", convId)
          .eq("is_read", false)
          .neq("sender_id", user.id)

        if (error) throw error

        // Update unread counts
        setUnreadCounts((prev) => ({
          ...prev,
          [convId]: 0,
        }))

        // Update conversations list
        setConversations((prev) => prev.map((conv) => (conv.id === convId ? { ...conv, unread_count: 0 } : conv)))
      } catch (error: any) {
        console.error("Error marking messages as read:", error)
      }
    },
    [user?.id],
  )

  // Send a message
  const sendMessage = useCallback(
    async (content: string, attachment?: File) => {
      if (!user?.id || !activeConversation) return null

      try {
        let attachmentUrl = null
        let attachmentType = null
        let attachmentName = null

        // Upload attachment if provided
        if (attachment) {
          const fileExt = attachment.name.split(".").pop()
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
          const filePath = `message-attachments/${user.id}/${fileName}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("attachments")
            .upload(filePath, attachment)

          if (uploadError) throw uploadError

          const { data: urlData } = await supabase.storage.from("attachments").getPublicUrl(filePath)

          attachmentUrl = urlData.publicUrl
          attachmentType = attachment.type
          attachmentName = attachment.name
        }

        // Create new message with temporary ID
        const tempId = `temp-${Date.now()}`
        const newMessage = {
          id: tempId,
          conversation_id: activeConversation.id,
          sender_id: user.id,
          content,
          created_at: new Date().toISOString(),
          status: "sending" as MessageStatus,
          is_read: false,
          attachment_url: attachmentUrl,
          attachment_type: attachmentType,
          attachment_name: attachmentName,
        }

        // Add to local state immediately
        setMessages((prev) => [...prev, newMessage])

        // Insert into database
        const { data, error } = await supabase
          .from("messages")
          .insert({
            conversation_id: activeConversation.id,
            sender_id: user.id,
            content,
            status: "sent",
            is_read: false,
            attachment_url: attachmentUrl,
            attachment_type: attachmentType,
            attachment_name: attachmentName,
          })
          .select()

        if (error) throw error

        // Update conversation's last message and time
        await supabase
          .from("conversations")
          .update({
            last_message: content,
            last_message_time: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", activeConversation.id)

        // Replace temporary message with actual message
        if (data && data[0]) {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === tempId ? { ...data[0], status: "sent" as MessageStatus } : msg)),
          )
          return data[0]
        }

        return null
      } catch (error: any) {
        console.error("Error sending message:", error)

        // Update message status to show error
        setMessages((prev) => prev.map((msg) => (msg.status === "sending" ? { ...msg, status: "error" as any } : msg)))

        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        })

        return null
      }
    },
    [user?.id, activeConversation],
  )

  // Create a new conversation
  const createConversation = useCallback(
    async (participantId: string, initialMessage: string) => {
      if (!user?.id) return null

      try {
        // Check if conversation already exists
        const { data: existingConvs } = await supabase
          .from("conversations")
          .select("*")
          .contains("participant_ids", [user.id, participantId])

        if (existingConvs && existingConvs.length > 0) {
          // Conversation exists, return it
          setActiveConversation(existingConvs[0])
          await fetchMessages(existingConvs[0].id)

          // Send initial message if provided
          if (initialMessage) {
            await sendMessage(initialMessage)
          }

          return existingConvs[0]
        }

        // Create new conversation
        const { data: newConv, error: convError } = await supabase
          .from("conversations")
          .insert({
            participant_ids: [user.id, participantId],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()

        if (convError) throw convError

        if (!newConv || newConv.length === 0) {
          throw new Error("Failed to create conversation")
        }

        // Add participants
        const participants = [
          { conversation_id: newConv[0].id, user_id: user.id },
          { conversation_id: newConv[0].id, user_id: participantId },
        ]

        const { error: partError } = await supabase.from("conversation_participants").insert(participants)

        if (partError) throw partError

        // Get participant details
        const { data: participantData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role")
          .eq("id", participantId)
          .single()

        // Create conversation object with participant
        const conversation = {
          ...newConv[0],
          otherParticipant: participantData,
          unread_count: 0,
        }

        // Update state
        setConversations((prev) => [conversation, ...prev])
        setActiveConversation(conversation)

        // Send initial message if provided
        if (initialMessage) {
          await sendMessage(initialMessage)
        }

        return conversation
      } catch (error: any) {
        console.error("Error creating conversation:", error)
        toast({
          title: "Error",
          description: "Failed to create conversation",
          variant: "destructive",
        })
        return null
      }
    },
    [user?.id, fetchMessages, sendMessage],
  )

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return

    // Set up subscription for new messages
    const messagesChannel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message

          // Only process if we're not the sender
          if (newMessage.sender_id !== user.id) {
            // If this is for the active conversation, add it to messages
            if (activeConversation?.id === newMessage.conversation_id) {
              // Get sender details
              supabase
                .from("profiles")
                .select("id, full_name, avatar_url")
                .eq("id", newMessage.sender_id)
                .single()
                .then(({ data: sender }) => {
                  setMessages((prev) => [...prev, { ...newMessage, sender }])

                  // Mark as read immediately if this is the active conversation
                  markMessagesAsRead(newMessage.conversation_id)
                })
            } else {
              // Update unread count for this conversation
              setUnreadCounts((prev) => ({
                ...prev,
                [newMessage.conversation_id]: (prev[newMessage.conversation_id] || 0) + 1,
              }))

              // Update conversations list
              setConversations((prev) =>
                prev.map((conv) =>
                  conv.id === newMessage.conversation_id
                    ? {
                        ...conv,
                        last_message: newMessage.content,
                        last_message_time: newMessage.created_at,
                        unread_count: (conv.unread_count || 0) + 1,
                      }
                    : conv,
                ),
              )
            }

            // Show notification
            if (Notification.permission === "granted") {
              // Get sender name
              supabase
                .from("profiles")
                .select("full_name")
                .eq("id", newMessage.sender_id)
                .single()
                .then(({ data }) => {
                  const senderName = data?.full_name || "Someone"
                  new Notification("New Message", {
                    body: `${senderName}: ${newMessage.content.substring(0, 50)}${newMessage.content.length > 50 ? "..." : ""}`,
                  })
                })
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const updatedMessage = payload.new as Message

          // Update message status
          setMessages((prev) => prev.map((msg) => (msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg)))
        },
      )
      .subscribe()

    // Set up subscription for conversation changes
    const conversationsChannel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // New conversation - check if we're a participant
            const newConv = payload.new as any
            if (newConv.participant_ids.includes(user.id)) {
              // Refresh conversations to get the new one with all details
              fetchConversations()
            }
          } else if (payload.eventType === "UPDATE") {
            // Updated conversation
            const updatedConv = payload.new as any

            // Update in our list
            setConversations((prev) =>
              prev.map((conv) => (conv.id === updatedConv.id ? { ...conv, ...updatedConv } : conv)),
            )
          }
        },
      )
      .subscribe()

    // Clean up subscriptions
    return () => {
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(conversationsChannel)
    }
  }, [user?.id, activeConversation?.id, fetchConversations, markMessagesAsRead])

  // Initial data fetch
  useEffect(() => {
    if (user?.id) {
      fetchConversations()
    }
  }, [user?.id, fetchConversations])

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversation?.id) {
      fetchMessages(activeConversation.id)
    }
  }, [activeConversation?.id, fetchMessages])

  // Request notification permission
  useEffect(() => {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission()
    }
  }, [])

  return {
    messages,
    conversations,
    isLoading,
    activeConversation,
    setActiveConversation,
    sendMessage,
    createConversation,
    markMessagesAsRead,
    unreadCounts,
    refreshConversations: fetchConversations,
  }
}
