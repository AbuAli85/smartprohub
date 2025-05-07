"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase/client"

export async function createBooking(formData: FormData) {
  const userId = formData.get("userId") as string
  const serviceId = formData.get("serviceId") as string
  const date = formData.get("date") as string
  const time = formData.get("time") as string
  const notes = formData.get("notes") as string

  try {
    const { error } = await supabase.from("bookings").insert({
      user_id: userId,
      service_id: serviceId,
      date,
      time,
      notes,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/bookings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateBookingStatus(formData: FormData) {
  const id = formData.get("id") as string
  const status = formData.get("status") as "pending" | "confirmed" | "cancelled"

  try {
    const { error } = await supabase
      .from("bookings")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/bookings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteBooking(formData: FormData) {
  const id = formData.get("id") as string

  try {
    const { error } = await supabase.from("bookings").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/bookings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getAvailableTimeSlots(date: string, serviceId: string) {
  try {
    // This would typically query your database to find available time slots
    // based on service provider availability and existing bookings

    // For demo purposes, we'll return mock data
    const mockTimeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"]

    return { success: true, timeSlots: mockTimeSlots }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
