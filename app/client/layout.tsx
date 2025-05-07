import type React from "react"
import { RoleBasedLayout } from "@/components/layouts/role-based-layout"
import type { UserRole } from "@/lib/supabase/database.types"

const allowedRoles: UserRole[] = ["client"]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <RoleBasedLayout allowedRoles={allowedRoles}>{children}</RoleBasedLayout>
}
