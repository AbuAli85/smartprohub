"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, MessageSquare, Calendar, FileText, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

type Notification = {
  id: string
  user_id: string
  type: "message" | "booking" | "contract" | "system"
  title: string
  content: string
  is_read: boolean
  created_at: string
  action_url?: string
  sender_id?: string
  sender?: {
    full_name: string
    avatar_url: string
  }
}

export function NotificationCenter() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)

      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          sender:sender_id(full_name, avatar_url)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data || [])

      // Count unread notifications
      const unread = data?.filter((n) => !n.is_read).length || 0
      setUnreadCount(unread)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return

    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

      if (error) throw error

      // Update local state
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false)

      if (error) throw error

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))

      // Update unread count
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    await markAsRead(notification.id)

    // Navigate to action URL if provided
    if (notification.action_url) {
      router.push(notification.action_url)
    }

    // Close popover
    setOpen(false)
  }

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return

    // Initial fetch
    fetchNotifications()

    // Set up subscription
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification

          // Get sender details if needed
          if (newNotification.sender_id) {
            supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("id", newNotification.sender_id)
              .single()
              .then(({ data: sender }) => {
                setNotifications((prev) => [{ ...newNotification, sender }, ...prev])
              })
          } else {
            setNotifications((prev) => [newNotification, ...prev])
          }

          // Update unread count
          setUnreadCount((prev) => prev + 1)

          // Show browser notification
          if (Notification.permission === "granted") {
            new Notification(newNotification.title, {
              body: newNotification.content,
            })
          }
        },
      )
      .subscribe()

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, router])

  // Request notification permission
  useEffect(() => {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission()
    }
  }, [])

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4" />
      case "booking":
        return <Calendar className="h-4 w-4" />
      case "contract":
        return <FileText className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  // Filter notifications by type
  const getFilteredNotifications = (type: string) => {
    if (type === "all") return notifications
    return notifications.filter((n) => n.type === type)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <Card className="border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </div>
          </CardHeader>
          <Tabs defaultValue="all">
            <div className="px-4">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">
                  All
                </TabsTrigger>
                <TabsTrigger value="message" className="flex-1">
                  Messages
                </TabsTrigger>
                <TabsTrigger value="booking" className="flex-1">
                  Bookings
                </TabsTrigger>
                <TabsTrigger value="contract" className="flex-1">
                  Contracts
                </TabsTrigger>
              </TabsList>
            </div>

            {["all", "message", "booking", "contract"].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue} className="m-0">
                <ScrollArea className="h-[300px]">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-[300px]">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : getFilteredNotifications(tabValue).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] p-4 text-center">
                      <Bell className="h-10 w-10 text-muted-foreground mb-2" />
                      <h3 className="font-medium">No notifications</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        You don't have any {tabValue !== "all" ? tabValue : ""} notifications yet
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {getFilteredNotifications(tabValue).map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-muted transition-colors ${
                            !notification.is_read ? "bg-muted/50" : ""
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          {notification.sender ? (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={notification.sender.avatar_url || ""} />
                              <AvatarFallback>{notification.sender.full_name[0]}</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between">
                              <p
                                className={`font-medium text-sm ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}
                              >
                                {notification.title}
                              </p>
                              {!notification.is_read && <span className="flex h-2 w-2 rounded-full bg-primary" />}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{notification.content}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
