import { SupabaseSetupGuide } from "@/components/debug/supabase-setup-guide"

export const metadata = {
  title: "Supabase Setup - SmartPRO",
  description: "Set up Supabase for your SmartPRO Business Services Hub",
}

export default function SupabaseSetupPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Setup Guide</h1>
      <SupabaseSetupGuide />
    </div>
  )
}
