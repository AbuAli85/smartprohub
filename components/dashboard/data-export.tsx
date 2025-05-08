"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Download, FileDown } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export function DataExport() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dataType, setDataType] = useState("revenue")
  const [period, setPeriod] = useState("month")
  const [format, setFormat] = useState("csv")

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

  // Handle export
  const handleExport = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // For CSV, trigger a download
      if (format === "csv") {
        const url = `/api/dashboard/export?userId=${user.id}&type=${dataType}&period=${period}&format=${format}`
        const link = document.createElement("a")
        link.href = url
        link.target = "_blank"
        link.download = `${dataType}-data-${period}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: "Export started",
          description: "Your data export has started. Check your downloads folder.",
        })
      } else {
        // For JSON, fetch the data
        const response = await fetch(
          `/api/dashboard/export?userId=${user.id}&type=${dataType}&period=${period}&format=${format}`,
        )

        if (response.ok) {
          const data = await response.json()

          // Create a JSON file and download it
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `${dataType}-data-${period}.json`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)

          toast({
            title: "Export successful",
            description: "Your data has been exported successfully.",
          })
        } else {
          toast({
            title: "Export failed",
            description: "Failed to export data. Please try again.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Export failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Export Dashboard Data
        </CardTitle>
        <CardDescription>Export your dashboard data for analysis or reporting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="data-type">Data Type</Label>
          <Select value={dataType} onValueChange={setDataType}>
            <SelectTrigger id="data-type">
              <SelectValue placeholder="Select data type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue Data</SelectItem>
              <SelectItem value="bookings">Bookings</SelectItem>
              <SelectItem value="contracts">Contracts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time-period">Time Period</Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger id="time-period">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Export Format</Label>
          <RadioGroup value={format} onValueChange={setFormat} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="format-csv" />
              <Label htmlFor="format-csv">CSV</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="format-json" />
              <Label htmlFor="format-json">JSON</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleExport} disabled={isLoading || !user} className="w-full">
          {isLoading ? (
            <>Exporting...</>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
