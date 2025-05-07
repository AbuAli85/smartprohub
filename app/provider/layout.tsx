import type React from "react"
import { RoleBasedLayout } from "@/components/layouts/role-based-layout"
import type { UserRole } from "@/lib/supabase/database.types"

const allowedRoles: UserRole[] = ["provider"]

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return <RoleBasedLayout allowedRoles={allowedRoles}>{children}</RoleBasedLayout>
}
