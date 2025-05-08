// app/showcase/page.tsx
import { Suspense } from 'react'
import { SupabaseDemo } from '@/components/showcase/supabase-demo'
import { RedisDemo } from '@/components/showcase/redis-demo'
import { BlobDemo } from '@/components/showcase/blob-demo'
import { AIDemo } from '@/components/showcase/ai-demo'
import { NeonDemo } from '@/components/showcase/neon-demo'

export default function ShowcasePage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Integration Showcase</h1>
      
      <div className="grid gap-8">
        <Suspense fallback={<div>Loading Supabase demo...</div>}>
          <SupabaseDemo />
        </Suspense>
        
        <Suspense fallback={<div>Loading Redis demo...</div>}>
          <RedisDemo />
        </Suspense>
        
        <Suspense fallback={<div>Loading Blob demo...</div>}>
          <BlobDemo />
        </Suspense>
        
        <Suspense fallback={<div>Loading AI demo...</div>}>
          <AIDemo />
        </Suspense>
        
        <Suspense fallback={<div>Loading Neon demo...</div>}>
          <NeonDemo />
        </Suspense>
      </div>
    </div>
  )
}