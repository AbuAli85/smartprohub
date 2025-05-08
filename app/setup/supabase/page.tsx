import { SupabaseSetupGuide } from "@/components/setup/supabase-setup-guide"

export default function SupabaseSetupPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Supabase Setup Guide</h1>
      <SupabaseSetupGuide />
    </div>
  )
}
