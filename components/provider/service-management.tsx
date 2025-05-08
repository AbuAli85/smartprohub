"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Edit, Trash2, CheckCircle2, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type Service = {
  id: string
  name: string
  description: string
  price: number
  duration: number
  is_active: boolean
  provider_id: string
  created_at: string
  updated_at: string
}

export default function ServiceManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    is_active: true,
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [realtimeSubscribed, setRealtimeSubscribed] = useState(false)
  const { toast } = useToast()

  // Fetch services on component mount
  useEffect(() => {
    fetchServices()

    // Set up realtime subscription
    if (!realtimeSubscribed) {
      const subscription = supabase
        .channel("services-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "services",
          },
          (payload) => {
            console.log("Realtime update:", payload)
            fetchServices()
          },
        )
        .subscribe()

      setRealtimeSubscribed(true)

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [realtimeSubscribed])

  const fetchServices = async () => {
    try {
      setLoading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      // Fetch services for this provider
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("provider_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setServices(data || [])
    } catch (error: any) {
      console.error("Error fetching services:", error)
      toast({
        title: "Error fetching services",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Service name is required"
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required"
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = "Price must be a positive number"
    }

    if (!formData.duration || isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
      errors.duration = "Duration must be a positive number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" })
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData({ ...formData, is_active: checked })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      is_active: true,
    })
    setFormErrors({})
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      const serviceData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        duration: Number(formData.duration),
        is_active: formData.is_active,
        provider_id: user.id,
        updated_at: new Date().toISOString(),
      }

      let result

      if (editingId) {
        // Update existing service
        result = await supabase.from("services").update(serviceData).eq("id", editingId).eq("provider_id", user.id) // Security check

        if (result.error) throw result.error

        toast({
          title: "Service updated",
          description: "Your service has been updated successfully",
          variant: "default",
        })
      } else {
        // Create new service
        result = await supabase
          .from("services")
          .insert({
            ...serviceData,
            created_at: new Date().toISOString(),
          })
          .select()

        if (result.error) throw result.error

        toast({
          title: "Service created",
          description: "Your new service has been created successfully",
          variant: "default",
        })
      }

      // Close dialog and reset form
      setIsDialogOpen(false)
      resetForm()

      // Refresh services list
      fetchServices()
    } catch (error: any) {
      console.error("Error saving service:", error)
      toast({
        title: "Error saving service",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      is_active: service.is_active,
    })
    setEditingId(service.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return
    }

    try {
      setLoading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { error } = await supabase.from("services").delete().eq("id", id).eq("provider_id", user.id) // Security check

      if (error) throw error

      toast({
        title: "Service deleted",
        description: "The service has been deleted successfully",
        variant: "default",
      })

      // Refresh services list
      fetchServices()
    } catch (error: any) {
      console.error("Error deleting service:", error)
      toast({
        title: "Error deleting service",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleServiceStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { error } = await supabase
        .from("services")
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("provider_id", user.id) // Security check

      if (error) throw error

      toast({
        title: `Service ${!currentStatus ? "activated" : "deactivated"}`,
        description: `The service has been ${!currentStatus ? "activated" : "deactivated"} successfully`,
        variant: "default",
      })

      // Refresh services list
      fetchServices()
    } catch (error: any) {
      console.error("Error toggling service status:", error)
      toast({
        title: "Error updating service",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Service Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Service" : "Add New Service"}</DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update your service details below."
                  : "Fill in the details below to create a new service."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className={formErrors.name ? "text-red-500" : ""}>
                    Service Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className={formErrors.description ? "text-red-500" : ""}>
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={formErrors.description ? "border-red-500" : ""}
                    rows={3}
                  />
                  {formErrors.description && <p className="text-xs text-red-500">{formErrors.description}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price" className={formErrors.price ? "text-red-500" : ""}>
                      Price ($)
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={formErrors.price ? "border-red-500" : ""}
                    />
                    {formErrors.price && <p className="text-xs text-red-500">{formErrors.price}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration" className={formErrors.duration ? "text-red-500" : ""}>
                      Duration (minutes)
                    </Label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      min="1"
                      step="1"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className={formErrors.duration ? "border-red-500" : ""}
                    />
                    {formErrors.duration && <p className="text-xs text-red-500">{formErrors.duration}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_active" checked={formData.is_active} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setIsDialogOpen(false)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                    </>
                  ) : (
                    <>{editingId ? "Update" : "Create"}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {renderServicesList(services, loading)}
        </TabsContent>
        <TabsContent value="active" className="mt-6">
          {renderServicesList(
            services.filter((s) => s.is_active),
            loading,
          )}
        </TabsContent>
        <TabsContent value="inactive" className="mt-6">
          {renderServicesList(
            services.filter((s) => !s.is_active),
            loading,
          )}
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderServicesList(servicesList: Service[], isLoading: boolean) {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    if (servicesList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No services found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {services.length === 0 ? "You haven't created any services yet." : "No services match the selected filter."}
          </p>
          {services.length === 0 && (
            <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create your first service
            </Button>
          )}
        </div>
      )
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servicesList.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">{service.description}</div>
                  </div>
                </TableCell>
                <TableCell>${service.price.toFixed(2)}</TableCell>
                <TableCell>{service.duration} min</TableCell>
                <TableCell>
                  <Badge variant={service.is_active ? "default" : "secondary"}>
                    {service.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleServiceStatus(service.id, service.is_active)}
                      title={service.is_active ? "Deactivate" : "Activate"}
                    >
                      <CheckCircle2
                        className={`h-4 w-4 ${service.is_active ? "text-muted-foreground" : "text-green-500"}`}
                      />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEdit(service)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(service.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }
}
