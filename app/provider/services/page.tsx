"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { Loader2, Plus, Pencil, Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  category: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function ServicesPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "60",
    category: "Consultation",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [dbError, setDbError] = useState<string | null>(null)

  // Get the current user
  useEffect(() => {
    async function getUserId() {
      try {
        // First check if we're in a browser environment
        if (typeof window === "undefined") {
          console.log("Server-side rendering, skipping auth check")
          return
        }

        console.log("Checking for user session...")
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setAuthError(`Authentication error: ${error.message}`)
          return
        }

        if (data.session?.user) {
          console.log("User authenticated:", data.session.user.id)
          setUserId(data.session.user.id)
          setAuthError(null)
        } else {
          console.log("No user session found")
          setAuthError("No active session found. Please log in again.")

          // Redirect to login after a short delay
          setTimeout(() => {
            router.push("/auth/login?redirect=/provider/services")
          }, 2000)
        }
      } catch (error: any) {
        console.error("Failed to get user session:", error)
        setAuthError(`Error checking authentication: ${error.message}`)
      }
    }

    getUserId()
  }, [router])

  // Set up auth state change listener
  useEffect(() => {
    if (typeof window === "undefined") return

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event)

      if (event === "SIGNED_IN" && session?.user) {
        console.log("User signed in:", session.user.id)
        setUserId(session.user.id)
        setAuthError(null)
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out")
        setUserId(null)
        setAuthError("You have been signed out. Please log in again.")

        // Redirect to login
        router.push("/auth/login?redirect=/provider/services")
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  const fetchServices = async () => {
    if (!userId) {
      console.log("No user ID available, skipping service fetch")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setDbError(null)
      console.log("Fetching services for user:", userId)

      // Check if the table exists first
      try {
        const { data: tableCheck, error: tableError } = await supabase.from("provider_services").select("id").limit(1)

        if (tableError) {
          if (tableError.code === "42P01") {
            // PostgreSQL code for undefined_table
            setDbError("The services table doesn't exist. Please run the database setup script.")
            setLoading(false)
            return
          }
        }
      } catch (error) {
        console.error("Error checking table:", error)
      }

      // Fetch services
      const { data, error } = await supabase
        .from("provider_services")
        .select("*")
        .eq("provider_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching services:", error)
        setDbError(`Database error: ${error.message}`)
        setServices([])
      } else {
        console.log("Services fetched:", data)
        setServices(data || [])
        setDbError(null)
      }
    } catch (error: any) {
      console.error("Error fetching services:", error)
      setDbError(`Unexpected error: ${error.message}`)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchServices()
    }
  }, [userId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "60",
      category: "Consultation",
    })
    setSelectedService(null)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (service: Service) => {
    setSelectedService(service)
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category || "Consultation",
    })
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (service: Service) => {
    setSelectedService(service)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to create a service.",
        variant: "destructive",
      })
      return
    }

    if (!formData.name || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      console.log("Submitting service data:", { ...formData, provider_id: userId })

      const serviceData = {
        provider_id: userId,
        name: formData.name,
        description: formData.description || null,
        price: Number.parseFloat(formData.price),
        duration: Number.parseInt(formData.duration),
        category: formData.category,
        is_active: true,
      }

      let result

      if (selectedService) {
        // Update existing service
        console.log("Updating service:", selectedService.id)
        const { data, error } = await supabase
          .from("provider_services")
          .update({
            ...serviceData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedService.id)
          .select()

        if (error) {
          console.error("Error updating service:", error)
          throw error
        }

        console.log("Service updated:", data)
        result = data?.[0]
      } else {
        // Create new service
        console.log("Creating new service")
        const { data, error } = await supabase
          .from("provider_services")
          .insert({
            ...serviceData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()

        if (error) {
          console.error("Error creating service:", error)
          throw error
        }

        console.log("Service created:", data)
        result = data?.[0]
      }

      toast({
        title: "Success",
        description: selectedService ? "Service updated successfully" : "Service created successfully",
      })

      setIsDialogOpen(false)
      resetForm()
      fetchServices()
    } catch (error: any) {
      console.error("Error saving service:", error)

      // More detailed error message
      let errorMessage = "Failed to save service. Please try again."
      if (error.message) {
        errorMessage += ` Error: ${error.message}`
      }
      if (error.code === "42P01") {
        errorMessage = "The services table doesn't exist. Please run the database setup."
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedService) return

    try {
      setIsSubmitting(true)
      console.log("Deleting service:", selectedService.id)

      const { error } = await supabase.from("provider_services").delete().eq("id", selectedService.id)

      if (error) {
        console.error("Error deleting service:", error)
        throw error
      }

      console.log("Service deleted successfully")
      toast({
        title: "Success",
        description: "Service deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      fetchServices()
    } catch (error: any) {
      console.error("Error deleting service:", error)
      toast({
        title: "Error",
        description: `Failed to delete service: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRefreshSession = async () => {
    try {
      setLoading(true)
      setAuthError(null)

      // Force refresh the session
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error("Error refreshing session:", error)
        setAuthError(`Failed to refresh session: ${error.message}`)
        return
      }

      if (data.session?.user) {
        console.log("Session refreshed:", data.session.user.id)
        setUserId(data.session.user.id)
        fetchServices()
      } else {
        setAuthError("No active session found. Please log in again.")
        setTimeout(() => {
          router.push("/auth/login?redirect=/provider/services")
        }, 2000)
      }
    } catch (error: any) {
      console.error("Error in refresh:", error)
      setAuthError(`Error refreshing session: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRunDatabaseSetup = async () => {
    try {
      setLoading(true)
      setDbError(null)

      // Execute the SQL to create the table
      const response = await fetch("/api/setup/database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ setup: "provider_services" }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to set up database")
      }

      toast({
        title: "Success",
        description: "Database setup completed successfully",
      })

      // Refresh services
      fetchServices()
    } catch (error: any) {
      console.error("Error setting up database:", error)
      toast({
        title: "Error",
        description: `Failed to set up database: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const durationOptions = [
    { value: "15", label: "15 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "1 hour" },
    { value: "90", label: "1.5 hours" },
    { value: "120", label: "2 hours" },
    { value: "180", label: "3 hours" },
    { value: "240", label: "4 hours" },
  ]

  const categoryOptions = [
    "Consultation",
    "Coaching",
    "Training",
    "Design",
    "Development",
    "Marketing",
    "Legal",
    "Financial",
    "Other",
  ]

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`
    } else if (minutes === 60) {
      return "1 hour"
    } else if (minutes % 60 === 0) {
      return `${minutes / 60} hours`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours} hour${hours > 1 ? "s" : ""} ${mins} minute${mins > 1 ? "s" : ""}`
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Services</h1>
        <Button onClick={openAddDialog} disabled={!userId || !!authError || !!dbError}>
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      {/* Authentication Error Alert */}
      {authError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            {authError}
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={handleRefreshSession}>
                Refresh Session
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => router.push("/auth/login?redirect=/provider/services")}
              >
                Go to Login
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Database Error Alert */}
      {dbError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>
            {dbError}
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={handleRunDatabaseSetup}>
                Run Database Setup
              </Button>
              <Button variant="outline" size="sm" className="ml-2" onClick={() => router.push("/debug/supabase")}>
                Debug Connection
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : services.length === 0 && !authError && !dbError ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <h3 className="text-xl font-semibold mb-2">No services yet</h3>
            <p className="text-muted-foreground mb-4">Create your first service to offer to clients.</p>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" /> Add Service
            </Button>
          </CardContent>
        </Card>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{service.name}</h3>
                    <p className="text-muted-foreground text-sm">{service.category || "Uncategorized"}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(service)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(service)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm line-clamp-3">{service.description || "No description provided."}</p>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm">
                      <span className="font-medium">Duration:</span> {formatDuration(service.duration)}
                    </div>
                    <div className="text-lg font-bold">${service.price}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Add/Edit Service Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedService ? "Edit Service" : "Add New Service"}</DialogTitle>
            <DialogDescription>
              {selectedService
                ? "Update your service details below."
                : "Create a new service to offer to your clients."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Business Consultation"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this service includes..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={formData.duration} onValueChange={(value) => handleSelectChange("duration", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Service"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
