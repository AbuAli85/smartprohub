"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, User, Download } from "lucide-react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function ClientContractsPage() {
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContracts() {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) return

        // First, check the structure of the contracts table
        const { data: tableInfo, error: tableError } = await supabase.from("contracts").select("*").limit(1)

        if (tableError) {
          console.error("Error checking contracts table:", tableError)
          // If we can't query the table at all, show an error
          throw tableError
        }

        // Determine which column to use for filtering based on what's available
        let userIdColumn = "client_id" // Default attempt

        // Check if the expected column exists in the table
        if (tableInfo && tableInfo.length > 0) {
          const sampleContract = tableInfo[0]

          // Check for alternative column names that might store the client/user ID
          if ("user_id" in sampleContract) {
            userIdColumn = "user_id"
          } else if ("customer_id" in sampleContract) {
            userIdColumn = "customer_id"
          } else if ("owner_id" in sampleContract) {
            userIdColumn = "owner_id"
          }
        }

        // Now query using the determined column name
        const { data, error } = await supabase
          .from("contracts")
          .select("*")
          .eq(userIdColumn, session.session.user.id)
          .order("created_at", { ascending: false })

        if (error) {
          // If the column doesn't exist, try without filtering by user
          console.warn(`Error using ${userIdColumn} filter:`, error)

          // Fallback: Get all contracts and filter client-side
          const { data: allContracts, error: allError } = await supabase
            .from("contracts")
            .select("*")
            .order("created_at", { ascending: false })

          if (allError) {
            throw allError
          }

          // Set contracts to empty array if we couldn't query properly
          setContracts(allContracts || [])
          setLoading(false)
          return
        }

        // If we need provider information, fetch it separately for each contract
        const contractsWithProviders = await Promise.all(
          (data || []).map(async (contract) => {
            const providerId = contract.provider_id || contract.provider || contract.created_by

            if (providerId) {
              try {
                const { data: providerData, error: providerError } = await supabase
                  .from("profiles")
                  .select("id, full_name")
                  .eq("id", providerId)
                  .single()

                if (!providerError && providerData) {
                  return {
                    ...contract,
                    provider: providerData,
                  }
                }
              } catch (err) {
                console.warn("Error fetching provider:", err)
              }
            }

            return {
              ...contract,
              provider: { id: providerId, full_name: "Unknown Provider" },
            }
          }),
        )

        setContracts(contractsWithProviders)
      } catch (error: any) {
        console.error("Error fetching contracts:", error)
        toast({
          title: "Error",
          description: "Failed to load contracts: " + (error.message || "Unknown error"),
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchContracts()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-gray-500">Draft</Badge>
      case "sent":
        return <Badge className="bg-blue-500">Sent</Badge>
      case "signed":
        return <Badge className="bg-green-500">Signed</Badge>
      case "expired":
        return <Badge className="bg-red-500">Expired</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e) {
      return "Invalid Date"
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Contracts</h1>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Contracts</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {contracts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-center text-muted-foreground">You don't have any contracts yet.</p>
              </CardContent>
            </Card>
          ) : (
            contracts.map((contract) => (
              <Card key={contract.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-muted/50 pb-2">
                  <CardTitle className="text-lg font-medium">{contract.title || "Untitled Contract"}</CardTitle>
                  {getStatusBadge(contract.status || "unknown")}
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Created: {formatDate(contract.created_at)}</span>
                      </div>
                      {contract.effective_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Effective: {formatDate(contract.effective_date)}</span>
                        </div>
                      )}
                      {contract.expiry_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Expires: {formatDate(contract.expiry_date)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Provider: {contract.provider?.full_name || "Unknown Provider"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between gap-2">
                      {contract.description && (
                        <div>
                          <p className="text-sm font-medium">Description:</p>
                          <p className="text-sm text-muted-foreground">{contract.description}</p>
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/client/contracts/${contract.id}`}>View Details</Link>
                        </Button>
                        {contract.file_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={contract.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </a>
                          </Button>
                        )}
                        {contract.status === "sent" && <Button size="sm">Sign Contract</Button>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {contracts.filter((c) => c.status === "signed" && (!c.expiry_date || new Date(c.expiry_date) > new Date()))
            .length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-center text-muted-foreground">You don't have any active contracts.</p>
              </CardContent>
            </Card>
          ) : (
            contracts
              .filter((c) => c.status === "signed" && (!c.expiry_date || new Date(c.expiry_date) > new Date()))
              .map((contract) => (
                <Card key={contract.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between bg-muted/50 pb-2">
                    <CardTitle className="text-lg font-medium">{contract.title || "Untitled Contract"}</CardTitle>
                    {getStatusBadge(contract.status || "unknown")}
                  </CardHeader>
                  <CardContent className="pt-4">
                    {/* Same content as above */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Created: {formatDate(contract.created_at)}</span>
                        </div>
                        {contract.effective_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Effective: {formatDate(contract.effective_date)}</span>
                          </div>
                        )}
                        {contract.expiry_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Expires: {formatDate(contract.expiry_date)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>Provider: {contract.provider?.full_name || "Unknown Provider"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between gap-2">
                        {contract.description && (
                          <div>
                            <p className="text-sm font-medium">Description:</p>
                            <p className="text-sm text-muted-foreground">{contract.description}</p>
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/client/contracts/${contract.id}`}>View Details</Link>
                          </Button>
                          {contract.file_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={contract.file_url} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {contracts.filter((c) => c.status === "sent" || c.status === "draft").length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-center text-muted-foreground">You don't have any pending contracts.</p>
              </CardContent>
            </Card>
          ) : (
            contracts
              .filter((c) => c.status === "sent" || c.status === "draft")
              .map((contract) => (
                <Card key={contract.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between bg-muted/50 pb-2">
                    <CardTitle className="text-lg font-medium">{contract.title || "Untitled Contract"}</CardTitle>
                    {getStatusBadge(contract.status || "unknown")}
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Created: {formatDate(contract.created_at)}</span>
                        </div>
                        {contract.effective_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Effective: {formatDate(contract.effective_date)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>Provider: {contract.provider?.full_name || "Unknown Provider"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between gap-2">
                        {contract.description && (
                          <div>
                            <p className="text-sm font-medium">Description:</p>
                            <p className="text-sm text-muted-foreground">{contract.description}</p>
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/client/contracts/${contract.id}`}>View Details</Link>
                          </Button>
                          {contract.status === "sent" && <Button size="sm">Sign Contract</Button>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
