// app/docs/integrations/page.tsx
export default function IntegrationsDocsPage() {
    return (
      <div className="container py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Integrations Documentation</h1>
        <p className="text-gray-600 mb-8">Complete guide to using integrations in SmartPRO Business Services Hub</p>
        
        {/* Supabase */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Supabase</h2>
          <p className="mb-4">Used for authentication and database storage.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-2">Authentication</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
            {`import { getSupabase } from '@/lib/integrations'
  
  // Client-side auth
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'password'
  })`}
          </pre>
          
          <h3 className="text-xl font-semibold mt-6 mb-2">Database</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
            {`import { getSupabase } from '@/lib/integrations'
  
  // Query data
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)`}
          </pre>
        </section>
        
        {/* Add sections for other integrations */}
      </div>
    )
  }