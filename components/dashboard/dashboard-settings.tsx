"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Save, RotateCcw } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export function DashboardSettings() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState({
    layout: "default",
    visible_widgets: ["metrics", "revenue", "activity", "bookings"],
    theme: "light",
    refresh_interval: 30,
  })
  const [isSaving, setIsSaving] = useState(false)

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Error fetching user:", error)
      }
    }

    fetchUserData()
  }, [])

  // Fetch dashboard settings
  useEffect(() => {
    if (!user) return

    async function fetchSettings() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/dashboard/settings?userId=${user.id}`)

        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error("Error fetching dashboard settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [user])

  // Save settings
  const saveSettings = async () => {
    if (!user) return

    try {
      setIsSaving(true)

      const response = await fetch("/api/dashboard/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          settings,
        }),
      })

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "Your dashboard settings have been updated.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to save settings. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Reset settings to default
  const resetSettings = () => {
    setSettings({
      layout: "default",
      visible_widgets: ["metrics", "revenue", "activity", "bookings"],
      theme: "light",
      refresh_interval: 30,
    })

    toast({
      title: "Settings reset",
      description: "Your dashboard settings have been reset to default values.",
    })
  }

  // Toggle widget visibility
  const toggleWidget = (widget: string) => {
    setSettings((prev) => {
      const visible_widgets = [...prev.visible_widgets]

      if (visible_widgets.includes(widget)) {
        return {
          ...prev,
          visible_widgets: visible_widgets.filter((w) => w !== widget),
        }
      } else {
        return {
          ...prev,
          visible_widgets: [...visible_widgets, widget],
        }
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Dashboard Settings
        </CardTitle>
        <CardDescription>Customize your dashboard layout, widgets, and appearance</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="widgets">Widgets</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Dashboard Layout</h3>
              <RadioGroup
                value={settings.layout}
                onValueChange={(value) => setSettings({ ...settings, layout: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="layout-default" />
                  <Label htmlFor="layout-default">Default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compact" id="layout-compact" />
                  <Label htmlFor="layout-compact">Compact</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expanded" id="layout-expanded" />
                  <Label htmlFor="layout-expanded">Expanded</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Refresh Interval (seconds)</h3>
              <div className="flex items-center space-x-4">
                <Slider
                  value={[settings.refresh_interval]}
                  min={5}
                  max={60}
                  step={5}
                  onValueChange={(value) => setSettings({ ...settings, refresh_interval: value[0] })}
                  className="w-[200px]"
                />
                <span className="w-12 text-center">{settings.refresh_interval}s</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="widgets" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Visible Widgets</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="widget-metrics"
                    checked={settings.visible_widgets.includes("metrics")}
                    onCheckedChange={() => toggleWidget("metrics")}
                  />
                  <Label htmlFor="widget-metrics">Metrics Cards</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="widget-revenue"
                    checked={settings.visible_widgets.includes("revenue")}
                    onCheckedChange={() => toggleWidget("revenue")}
                  />
                  <Label htmlFor="widget-revenue">Revenue Chart</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="widget-activity"
                    checked={settings.visible_widgets.includes("activity")}
                    onCheckedChange={() => toggleWidget("activity")}
                  />
                  <Label htmlFor="widget-activity">Activity Feed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="widget-bookings"
                    checked={settings.visible_widgets.includes("bookings")}
                    onCheckedChange={() => toggleWidget("bookings")}
                  />
                  <Label htmlFor="widget-bookings">Recent Bookings</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Theme</h3>
              <RadioGroup value={settings.theme} onValueChange={(value) => setSettings({ ...settings, theme: value })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light">Light</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark">Dark</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label htmlFor="theme-system">System</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetSettings} disabled={isLoading || isSaving}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Default
        </Button>
        <Button onClick={saveSettings} disabled={isLoading || isSaving}>
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
