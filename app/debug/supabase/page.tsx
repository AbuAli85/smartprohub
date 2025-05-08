import { SupabaseDebug } from "@/components/debug/supabase-debug"

export default function SupabaseDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Supabase Debug</h1>
      <SupabaseDebug />
    </div>
  )
}
