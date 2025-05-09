"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export function RedisTest() {
  const [key, setKey] = useState("test-key")
  const [value, setValue] = useState("Hello from SmartPRO!")
  const [retrievedValue, setRetrievedValue] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [operation, setOperation] = useState<"set" | "get" | "delete" | null>(null)
  const [message, setMessage] = useState("")

  // Set a value in Redis
  const handleSet = async () => {
    setStatus("loading")
    setOperation("set")
    setMessage("Setting value in Redis...")

    try {
      const response = await fetch("/api/test/redis/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, value }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(`Successfully set value for key "${key}"`)
      } else {
        setStatus("error")
        setMessage(`Failed to set value: ${data.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error setting Redis value:", error)
      setStatus("error")
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Get a value from Redis
  const handleGet = async () => {
    setStatus("loading")
    setOperation("get")
    setMessage("Getting value from Redis...")
    setRetrievedValue(null)

    try {
      const response = await fetch(`/api/test/redis/get?key=${encodeURIComponent(key)}`)
      const data = await response.json()

      if (response.ok) {
        if (data.value !== null) {
          setStatus("success")
          setMessage(`Successfully retrieved value for key "${key}"`)
          setRetrievedValue(JSON.stringify(data.value, null, 2))
        } else {
          setStatus("error")
          setMessage(`Key "${key}" not found in Redis`)
        }
      } else {
        setStatus("error")
        setMessage(`Failed to get value: ${data.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error getting Redis value:", error)
      setStatus("error")
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Delete a value from Redis
  const handleDelete = async () => {
    setStatus("loading")
    setOperation("delete")
    setMessage("Deleting value from Redis...")

    try {
      const response = await fetch(`/api/test/redis/delete?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(`Successfully deleted key "${key}"`)
        setRetrievedValue(null)
      } else {
        setStatus("error")
        setMessage(`Failed to delete key: ${data.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error deleting Redis key:", error)
      setStatus("error")
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Reset the form
  const handleReset = () => {
    setKey("test-key")
    setValue("Hello from SmartPRO!")
    setRetrievedValue(null)
    setStatus("idle")
    setOperation(null)
    setMessage("")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Redis Test Utility</CardTitle>
        <CardDescription>Test Redis operations to verify your connection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status !== "idle" && (
          <Alert
            className={
              status === "success"
                ? "bg-green-50 border-green-200"
                : status === "error"
                  ? "bg-red-50 border-red-200"
                  : "bg-blue-50 border-blue-200"
            }
          >
            {status === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
            {status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
            {status === "loading" && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
            <AlertTitle>{status === "success" ? "Success" : status === "error" ? "Error" : "Processing"}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="redis-key">Redis Key</Label>
          <Input
            id="redis-key"
            placeholder="Enter a key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            disabled={status === "loading"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="redis-value">Redis Value</Label>
          <Textarea
            id="redis-value"
            placeholder="Enter a value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={status === "loading"}
            rows={3}
          />
        </div>

        {retrievedValue !== null && (
          <div className="space-y-2">
            <Label htmlFor="retrieved-value">Retrieved Value</Label>
            <Textarea id="retrieved-value" value={retrievedValue} readOnly rows={5} className="font-mono text-sm" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={status === "loading"}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
        <div className="flex-1"></div>
        <Button
          onClick={handleSet}
          disabled={!key || !value || status === "loading"}
          className="flex items-center gap-2"
          variant={operation === "set" && status === "success" ? "success" : "default"}
        >
          {operation === "set" && status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          Set Value
        </Button>
        <Button
          onClick={handleGet}
          disabled={!key || status === "loading"}
          className="flex items-center gap-2"
          variant={operation === "get" && status === "success" ? "success" : "default"}
        >
          {operation === "get" && status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          Get Value
        </Button>
        <Button
          onClick={handleDelete}
          disabled={!key || status === "loading"}
          className="flex items-center gap-2"
          variant="destructive"
        >
          {operation === "delete" && status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          Delete Key
        </Button>
      </CardFooter>
    </Card>
  )
}
