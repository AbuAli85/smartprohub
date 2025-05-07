import type React from "react"
import { RoleBasedLayout } from "@/components/layouts/role-based-layout"
import type { UserRole } from "@/lib/supabase/database.types"

const allowedRoles: UserRole[] = ["admin"]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleBasedLayout allowedRoles={allowedRoles}>{children}</RoleBasedLayout>
}
