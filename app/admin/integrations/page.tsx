"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export default function IntegrationsPage() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const integrations = [
    { name: "Supabase", endpoint: "/api/test/supabase", description: "Authentication and database" },
    { name: "Redis", endpoint: "/api/test/redis", description: "Real-time messaging and caching" },
    { name: "Blob", endpoint: "/api/test/blob", description: "File storage and uploads" },
    { name: "Neon", endpoint: "/api/test/neon", description: "PostgreSQL database" },
    { name: "AI (Groq)", endpoint: "/api/test/ai/groq", description: "Fast AI model access" },
    { name: "AI (Grok)", endpoint: "/api/test/ai/grok", description: "Advanced AI capabilities" },
    { name: "AI (DeepInfra)", endpoint: "/api/test/ai/deepinfra", description: "Specialized AI models" },
  ]

  const testIntegration = async (name: string, endpoint: string) => {
    setLoading((prev) => ({ ...prev, [name]: true }))
    try {
      const response = await fetch(endpoint)
      const data = await response.json()
      setResults((prev) => ({ ...prev, [name]: data }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [name]: { status: "error", message: "Request failed", error: String(error) },
      }))
    } finally {
      setLoading((prev) => ({ ...prev, [name]: false }))
    }
  }

  const testAll = () => {
    integrations.forEach((integration) => {
      testIntegration(integration.name, integration.endpoint)
    })
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Integration Tests</h1>
        <Button onClick={testAll}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Test All Integrations
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.name}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{integration.name}</CardTitle>
                {results[integration.name]?.status === "success" ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="mr-1 h-3 w-3" /> Connected
                  </Badge>
                ) : results[integration.name]?.status === "error" ? (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <AlertCircle className="mr-1 h-3 w-3" /> Failed
                  </Badge>
                ) : (
                  <Badge variant="outline">Not Tested</Badge>
                )}
              </div>
              <CardDescription>{integration.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading[integration.name] ? (
                <div className="flex justify-center py-4">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : results[integration.name] ? (
                <div className="text-sm">
                  <p className="font-medium">{results[integration.name].message}</p>
                  {results[integration.name].error && (
                    <p className="text-red-500 mt-2">{results[integration.name].error}</p>
                  )}
                  {results[integration.name].status === "success" && (
                    <pre className="bg-muted p-2 rounded-md mt-2 text-xs overflow-auto max-h-24">
                      {JSON.stringify(results[integration.name], null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Click the button below to test this integration</p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => testIntegration(integration.name, integration.endpoint)}
                disabled={loading[integration.name]}
                variant="outline"
                className="w-full"
              >
                {loading[integration.name] && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Test {integration.name}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
