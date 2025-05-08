"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"

type Notification = {
  id: string
  user_id: string
  title: string
  content: string
  type: string
  read: boolean
  created_at: string
  action_url?: string
  sender_id?: string
  sender_name?: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Error fetching notifications:", error)
        return
      }

      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => !n.read).length || 0)
    } catch (error) {
      console.error("Error in fetchNotifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return

    try {
      await supabase.from("notifications").update({ read: true }).eq("id", notificationId).eq("user_id", user.id)

      // Update local state
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return

    try {
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false)

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id)
    }

    // Navigate to the action URL if provided
    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  // Format notification time
  const formatNotificationTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()

      // If it's today, show relative time
      if (date.toDateString() === now.toDateString()) {
        return formatDistanceToNow(date, { addSuffix: true })
      }

      // Otherwise show the date
      return format(date, "MMM d, yyyy")
    } catch (e) {
      return ""
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return

    // Initial fetch
    fetchNotifications()

    // Subscribe to new notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newNotification = payload.new as Notification

          // Add to local state
          setNotifications((prev) => [newNotification, ...prev])
          setUnreadCount((prev) => prev + 1)

          // Show browser notification if supported
          if (Notification.permission === "granted") {
            new Notification(newNotification.title, {
              body: newNotification.content,
            })
          }
        },
      )
      .subscribe()

    // Request notification permission
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission()
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  if (!user) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No notifications</div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div key={notification.id} className="group">
                  <button
                    className={`w-full text-left p-4 hover:bg-muted ${!notification.read ? "bg-muted/50" : ""}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{notification.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatNotificationTime(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                    {notification.sender_name && (
                      <p className="text-xs text-muted-foreground mt-1">From: {notification.sender_name}</p>
                    )}
                  </button>
                  <Separator />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
