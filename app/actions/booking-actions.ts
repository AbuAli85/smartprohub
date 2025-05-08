"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase/client"

// Define types for booking data
interface BookingData {
  provider_id: string
  client_id: string
  service_id: string
  booking_date: string
  start_time: string
  end_time: string
  status: string
  notes?: string
}

/**
 * Create a new booking
 */
export async function createBooking(formData: FormData) {
  try {
    // Extract data from form
    const provider_id = formData.get("provider_id") as string
    const client_id = formData.get("client_id") as string
    const service_id = formData.get("service_id") as string
    const booking_date = formData.get("booking_date") as string
    const start_time = formData.get("start_time") as string
    const end_time = formData.get("end_time") as string
    const notes = formData.get("notes") as string

    // Validate required fields
    if (!provider_id || !client_id || !service_id || !booking_date || !start_time || !end_time) {
      return { error: "Missing required fields" }
    }

    // Create booking in database
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        provider_id,
        client_id,
        service_id,
        booking_date,
        start_time,
        end_time,
        status: "pending",
        notes: notes || null,
      })
      .select()

    if (error) {
      console.error("Error creating booking:", error)
      return { error: error.message }
    }

    // Revalidate the bookings page to show the new booking
    revalidatePath("/dashboard/bookings")

    return { success: true, data }
  } catch (error) {
    console.error("Error in createBooking:", error)
    return { error: "Failed to create booking" }
  }
}

/**
 * Update a booking status
 */
export async function updateBookingStatus(formData: FormData) {
  try {
    const id = formData.get("id") as string
    const status = formData.get("status") as string

    if (!id || !status) {
      return { error: "Missing booking ID or status" }
    }

    const { data, error } = await supabase.from("bookings").update({ status }).eq("id", id).select()

    if (error) {
      console.error("Error updating booking status:", error)
      return { error: error.message }
    }

    revalidatePath("/dashboard/bookings")

    return { success: true, data }
  } catch (error) {
    console.error("Error in updateBookingStatus:", error)
    return { error: "Failed to update booking status" }
  }
}

/**
 * Delete a booking
 */
export async function deleteBooking(formData: FormData) {
  try {
    const id = formData.get("id") as string

    if (!id) {
      return { error: "Missing booking ID" }
    }

    const { error } = await supabase.from("bookings").delete().eq("id", id)

    if (error) {
      console.error("Error deleting booking:", error)
      return { error: error.message }
    }

    revalidatePath("/dashboard/bookings")

    return { success: true }
  } catch (error) {
    console.error("Error in deleteBooking:", error)
    return { error: "Failed to delete booking" }
  }
}

/**
 * Get bookings for a specific user (either as provider or client)
 */
export async function getUserBookings(userId: string, role: "provider" | "client") {
  try {
    const column = role === "provider" ? "provider_id" : "client_id"

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        services:service_id (name, description, price, duration),
        providers:provider_id (id, email, first_name, last_name),
        clients:client_id (id, email, first_name, last_name)
      `)
      .eq(column, userId)
      .order("booking_date", { ascending: false })

    if (error) {
      console.error("Error fetching user bookings:", error)
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error("Error in getUserBookings:", error)
    return { error: "Failed to fetch bookings" }
  }
}
