"use client"

import { ProfileSync } from "@/components/auth/profile-sync"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      // Check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        router.push("/auth/login?redirectTo=/profile")
        return
      }

      // Get user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionData.session.user.id)
        .single()

      setProfile(profileData)
      setLoading(false)
    }

    loadProfile()
  }, [router])

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading profile...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your current profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url || "/placeholder.svg"}
                      alt={profile.full_name || "Profile"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                      {(profile?.full_name || "User").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{profile?.full_name || "User"}</h3>
                  <p className="text-gray-500">{profile?.email}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <p className="capitalize">{profile?.role || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email Confirmed</p>
                    <p>{profile?.email_confirmed ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p>{profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "Unknown"}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <ProfileSync />
      </div>
    </div>
  )
}
