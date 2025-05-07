"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase/client"

export async function createUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const role = formData.get("role") as string

  try {
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    // Create the user profile in the profiles table
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateUser(formData: FormData) {
  const id = formData.get("id") as string
  const fullName = formData.get("fullName") as string
  const role = formData.get("role") as string
  const phone = formData.get("phone") as string
  const company = formData.get("company") as string
  const position = formData.get("position") as string

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        role,
        phone,
        company,
        position,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteUser(formData: FormData) {
  const id = formData.get("id") as string

  try {
    // Delete the user from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id)

    if (authError) {
      return { success: false, error: authError.message }
    }

    // The profile should be deleted automatically via RLS policies or triggers
    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateProfile(formData: FormData) {
  const id = formData.get("id") as string
  const fullName = formData.get("fullName") as string
  const phone = formData.get("phone") as string
  const company = formData.get("company") as string
  const position = formData.get("position") as string
  const bio = formData.get("bio") as string

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        company,
        position,
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/profile")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
