// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/integrations'
import { getRedis } from '@/lib/integrations'
import { getNeon } from '@/lib/integrations'

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {} as Record<string, { status: string; message?: string }>
  }

  // Check Supabase
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase.from('health_check').select('count', { count: 'exact', head: true })
    health.services.supabase = { status: error ? 'error' : 'ok' }
    if (error) health.services.supabase.message = error.message
  } catch (e: any) {
    health.services.supabase = { status: 'error', message: e.message }
  }

  // Check Redis
  try {
    const redis = getRedis()
    const ping = await redis.ping()
    health.services.redis = { status: ping === 'PONG' ? 'ok' : 'error' }
  } catch (e: any) {
    health.services.redis = { status: 'error', message: e.message }
  }

  // Check Neon
  try {
    const neon = getNeon()
    const result = await neon`SELECT 1 as health`
    health.services.neon = { status: result[0]?.health === 1 ? 'ok' : 'error' }
  } catch (e: any) {
    health.services.neon = { status: 'error', message: e.message }
  }

  // Overall status
  health.status = Object.values(health.services).some(s => s.status === 'error') ? 'degraded' : 'ok'

  return NextResponse.json(health)
}