"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Mail, Calendar, FileText, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ProviderClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [filteredClients, setFilteredClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [databaseError, setDatabaseError] = useState<boolean>(false)

  useEffect(() => {
    async function fetchClients() {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) {
          setLoading(false)
          return
        }

        const providerId = session.session.user.id

        // First check if the provider_clients table exists
        try {
          const { error: tableCheckError } = await supabase
            .from("provider_clients")
            .select("count", { count: "exact", head: true })

          if (tableCheckError) {
            if (tableCheckError.code === "42P01") {
              // PostgreSQL error code for undefined_table
              setDatabaseError(true)
              setError("Database tables not set up. Please run the database setup first.")
              setLoading(false)
              return
            }
          }
        } catch (error) {
          console.error("Error checking table:", error)
        }

        // First get client IDs from provider_clients junction table
        const { data: providerClients, error: providerClientsError } = await supabase
          .from("provider_clients")
          .select("client_id")
          .eq("provider_id", providerId)

        if (providerClientsError) {
          if (providerClientsError.code === "42P01") {
            // PostgreSQL error code for undefined_table
            setDatabaseError(true)
            setError("Database tables not set up. Please run the database setup first.")
            setLoading(false)
            return
          } else {
            throw providerClientsError
          }
        }

        if (!providerClients || providerClients.length === 0) {
          setClients([])
          setFilteredClients([])
          setLoading(false)
          return
        }

        // Extract client IDs
        const clientIds = providerClients.map((pc) => pc.client_id)

        // Fetch client details
        const { data: clientsData, error: clientsError } = await supabase
          .from("profiles")
          .select(`
            id, 
            full_name, 
            email, 
            phone, 
            avatar_url, 
            created_at
          `)
          .in("id", clientIds)
          .eq("role", "client")

        if (clientsError) throw clientsError

        // For each client, fetch additional data
        const clientsWithData = await Promise.all(
          (clientsData || []).map(async (client) => {
            try {
              // Fetch bookings count
              const { count: bookingsCount, error: bookingsError } = await supabase
                .from("bookings")
                .select("id", { count: "exact" })
                .eq("client_id", client.id)
                .eq("provider_id", providerId)

              if (bookingsError && bookingsError.code !== "42P01") throw bookingsError

              // Fetch contracts count
              const { count: contractsCount, error: contractsError } = await supabase
                .from("contracts")
                .select("id", { count: "exact" })
                .eq("client_id", client.id)
                .eq("provider_id", providerId)

              if (contractsError && contractsError.code !== "42P01") throw contractsError

              // Return client with additional data
              return {
                ...client,
                bookingsCount: bookingsCount || 0,
                contractsCount: contractsCount || 0,
              }
            } catch (error) {
              console.error("Error fetching client data:", error)
              return {
                ...client,
                bookingsCount: 0,
                contractsCount: 0,
              }
            }
          }),
        )

        setClients(clientsWithData)
        setFilteredClients(clientsWithData)
      } catch (error: any) {
        console.error("Error fetching clients:", error)
        setError(error.message || "Failed to load clients")
        toast({
          title: "Error",
          description: "Failed to load clients",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  // Filter clients when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = clients.filter(
      (client) =>
        client.full_name?.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.phone?.includes(query),
    )

    setFilteredClients(filtered)
  }, [searchQuery, clients])

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

  if (databaseError) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>{error || "Database tables not set up properly."}</AlertDescription>
        </Alert>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="mb-4 text-center text-muted-foreground">
              Please run the database setup to create the necessary tables.
            </p>
            <Button asChild>
              <Link href="/setup/database">Go to Database Setup</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !databaseError) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={() => window.location.reload()} className="mb-6">
          Retry
        </Button>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="mb-4 text-center text-muted-foreground">Unable to load clients. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Clients</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
              className="w-[250px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>Add Client</Button>
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="mb-4 text-center text-muted-foreground">
              {searchQuery ? "No clients match your search" : "You don't have any clients yet."}
            </p>
            {!searchQuery && <Button>Add Your First Client</Button>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={client.avatar_url || ""} alt={client.full_name || ""} />
                    <AvatarFallback>{client.full_name?.[0] || "C"}</AvatarFallback>
                  </Avatar>
                  {client.full_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${client.email}`} className="text-sm hover:underline">
                      {client.email}
                    </a>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${client.phone}`} className="text-sm hover:underline">
                        {client.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Client since {formatDate(client.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{client.bookingsCount} Bookings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{client.contractsCount} Contracts</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/provider/clients/${client.id}`}>View Profile</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/provider/bookings/new?client=${client.id}`}>Book Session</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
