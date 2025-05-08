"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "@/components/ui/use-toast"

export type Message = {
  id: string
  sender_id: string
  recipient_id: string
  conversation_id: string
  content: string
  attachment_url?: string
  created_at: string
  status: "sending" | "sent" | "delivered" | "read"
  sender_profile?: {
    full_name?: string
    avatar_url?: string
  }
}

export type Conversation = {
  id: string
  created_at: string
  updated_at: string
  last_message?: string
  last_message_time?: string
  unread_count: number
  participants: {
    id: string
    full_name?: string
    avatar_url?: string
    role?: string
  }[]
}

export function useRealtimeMessaging(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const { user, profile } = useAuth()

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(
    async (convoId: string) => {
      if (!user) return

      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("messages")
          .select(`
          *,
          sender_profile:profiles!sender_id(full_name, avatar_url)
        `)
          .eq("conversation_id", convoId)
          .order("created_at", { ascending: true })

        if (error) {
          console.error("Error fetching messages:", error)
          return
        }

        setMessages(data || [])

        // Mark messages as read
        if (data && data.length > 0) {
          const unreadMessages = data.filter((msg) => msg.recipient_id === user.id && msg.status !== "read")

          if (unreadMessages.length > 0) {
            await supabase
              .from("messages")
              .update({ status: "read" })
              .in(
                "id",
                unreadMessages.map((msg) => msg.id),
              )
          }
        }
      } catch (error) {
        console.error("Error in fetchMessages:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [user],
  )

  // Fetch all conversations for the current user
  const fetchConversations = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // This is a simplified query - in a real app, you'd need a more complex query
      // to get the actual conversations with the last message and unread count
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          participants:conversation_participants(
            user_id,
            profiles(id, full_name, avatar_url, role)
          )
        `)
        .eq("conversation_participants.user_id", user.id)

      if (error) {
        console.error("Error fetching conversations:", error)
        return
      }

      // Transform the data to match our Conversation type
      const formattedConversations = (data || []).map((convo) => {
        // Filter out the current user from participants
        const otherParticipants = convo.participants
          .filter((p) => p.user_id !== user.id)
          .map((p) => ({
            id: p.profiles.id,
            full_name: p.profiles.full_name,
            avatar_url: p.profiles.avatar_url,
            role: p.profiles.role,
          }))

        return {
          id: convo.id,
          created_at: convo.created_at,
          updated_at: convo.updated_at,
          last_message: convo.last_message,
          last_message_time: convo.last_message_time,
          unread_count: convo.unread_count || 0,
          participants: otherParticipants,
        }
      })

      setConversations(formattedConversations)
    } catch (error) {
      console.error("Error in fetchConversations:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Send a new message
  const sendMessage = useCallback(
    async (recipientId: string, content: string, convoId?: string, attachmentUrl?: string) => {
      if (!user) return null

      try {
        setIsSending(true)

        // If no conversation ID is provided, we need to create a new conversation
        let conversationId = convoId

        if (!conversationId) {
          // Create a new conversation
          const { data: convoData, error: convoError } = await supabase
            .from("conversations")
            .insert({})
            .select()
            .single()

          if (convoError) {
            console.error("Error creating conversation:", convoError)
            return null
          }

          conversationId = convoData.id

          // Add participants to the conversation
          await supabase.from("conversation_participants").insert([
            { conversation_id: conversationId, user_id: user.id },
            { conversation_id: conversationId, user_id: recipientId },
          ])
        }

        // Create a temporary ID for optimistic UI updates
        const tempId = `temp-${Date.now()}`

        // Add message to local state immediately for optimistic UI
        const newMessage: Message = {
          id: tempId,
          sender_id: user.id,
          recipient_id: recipientId,
          conversation_id: conversationId,
          content,
          attachment_url: attachmentUrl,
          created_at: new Date().toISOString(),
          status: "sending",
          sender_profile: {
            full_name: profile?.full_name,
            avatar_url: profile?.avatar_url,
          },
        }

        setMessages((prev) => [...prev, newMessage])

        // Send the message to the server
        const { data, error } = await supabase
          .from("messages")
          .insert({
            sender_id: user.id,
            recipient_id: recipientId,
            conversation_id: conversationId,
            content,
            attachment_url: attachmentUrl,
            status: "sent",
          })
          .select()
          .single()

        if (error) {
          console.error("Error sending message:", error)

          // Remove the optimistic message on error
          setMessages((prev) => prev.filter((msg) => msg.id !== tempId))
          toast({
            title: "Failed to send message",
            description: "Please try again later",
            variant: "destructive",
          })
          return null
        }

        // Replace the temporary message with the real one
        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? data : msg)))

        // Update the conversation's last message
        await supabase
          .from("conversations")
          .update({
            last_message: content,
            last_message_time: new Date().toISOString(),
          })
          .eq("id", conversationId)

        return data
      } catch (error) {
        console.error("Error in sendMessage:", error)
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        })
        return null
      } finally {
        setIsSending(false)
      }
    },
    [user, profile],
  )

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return

    // Subscribe to new messages
    const channel = supabase
      .channel("messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMessage = payload.new as Message

        // Only add the message if it's for the current conversation
        // or if it's sent to or from the current user
        if (
          (conversationId && newMessage.conversation_id === conversationId) ||
          (!conversationId && (newMessage.recipient_id === user.id || newMessage.sender_id === user.id))
        ) {
          // Fetch the sender profile
          supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", newMessage.sender_id)
            .single()
            .then(({ data }) => {
              if (data) {
                newMessage.sender_profile = data
              }

              setMessages((prev) => {
                // Check if we already have this message (to avoid duplicates)
                const exists = prev.some((msg) => msg.id === newMessage.id)
                if (exists) return prev
                return [...prev, newMessage]
              })

              // If the message is for the current user, mark it as delivered
              if (newMessage.recipient_id === user.id) {
                supabase
                  .from("messages")
                  .update({ status: conversationId ? "read" : "delivered" })
                  .eq("id", newMessage.id)
              }
            })
        }

        // Update conversations list if needed
        if (!conversationId) {
          fetchConversations()
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, (payload) => {
        const updatedMessage = payload.new as Message

        // Update the message status in our local state
        setMessages((prev) =>
          prev.map((msg) => (msg.id === updatedMessage.id ? { ...msg, status: updatedMessage.status } : msg)),
        )
      })
      .subscribe()

    // Fetch initial data
    if (conversationId) {
      fetchMessages(conversationId)
    } else {
      fetchConversations()
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, conversationId, fetchMessages, fetchConversations])

  return {
    messages,
    conversations,
    isLoading,
    isSending,
    sendMessage,
    fetchMessages,
    fetchConversations,
  }
}
