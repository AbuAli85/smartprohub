"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, User, Download, Plus } from "lucide-react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function ProviderContractsPage() {
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContracts() {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) return

        const { data, error } = await supabase
          .from("contracts")
          .select(`
            *,
            client:client_id(id, full_name)
          `)
          .eq("provider_id", session.session.user.id)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setContracts(data || [])
      } catch (error: any) {
        console.error("Error fetching contracts:", error)
        toast({
          title: "Error",
          description: "Failed to load contracts",
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
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
        <h1 className="text-3xl font-bold">Contracts</h1>
        <Button asChild>
          <Link href="/provider/contracts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Contract
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Contracts</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {contracts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="mb-4 text-center text-muted-foreground">You don't have any contracts yet.</p>
                <Button asChild>
                  <Link href="/provider/contracts/new">Create Your First Contract</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            contracts.map((contract) => (
              <Card key={contract.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-muted/50 pb-2">
                  <CardTitle className="text-lg font-medium">{contract.title}</CardTitle>
                  {getStatusBadge(contract.status)}
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
                        <span>Client: {contract.client?.full_name || "Unknown Client"}</span>
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
                          <Link href={`/provider/contracts/${contract.id}`}>View Details</Link>
                        </Button>
                        {contract.file_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={contract.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </a>
                          </Button>
                        )}
                        {contract.status === "draft" && <Button size="sm">Send to Client</Button>}
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
                    <CardTitle className="text-lg font-medium">{contract.title}</CardTitle>
                    {getStatusBadge(contract.status)}
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
                          <span>Client: {contract.client?.full_name || "Unknown Client"}</span>
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
                            <Link href={`/provider/contracts/${contract.id}`}>View Details</Link>
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

        <TabsContent value="drafts" className="space-y-4">
          {contracts.filter((c) => c.status === "draft").length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-center text-muted-foreground">You don't have any draft contracts.</p>
              </CardContent>
            </Card>
          ) : (
            contracts
              .filter((c) => c.status === "draft")
              .map((contract) => (
                <Card key={contract.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between bg-muted/50 pb-2">
                    <CardTitle className="text-lg font-medium">{contract.title}</CardTitle>
                    {getStatusBadge(contract.status)}
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Created: {formatDate(contract.created_at)}</span>
                        </div>
                        {contract.client && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>Client: {contract.client?.full_name || "Unknown Client"}</span>
                          </div>
                        )}
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
                            <Link href={`/provider/contracts/${contract.id}/edit`}>Edit</Link>
                          </Button>
                          <Button size="sm">Send to Client</Button>
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
