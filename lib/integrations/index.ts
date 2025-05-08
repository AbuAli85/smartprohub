// lib/integrations/index.ts
import { createSupabaseClient } from './supabase'
import { createRedisClient } from './redis'
import { createNeonClient } from './neon'
import { createBlobClient } from './blob'
import { createAIClient } from './ai'

// Singleton instances
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null
let redisInstance: ReturnType<typeof createRedisClient> | null = null
let neonInstance: ReturnType<typeof createNeonClient> | null = null
let blobInstance: ReturnType<typeof createBlobClient> | null = null
let aiInstance: ReturnType<typeof createAIClient> | null = null

export function getSupabase() {
  if (!supabaseInstance) supabaseInstance = createSupabaseClient()
  return supabaseInstance
}

export function getRedis() {
  if (!redisInstance) redisInstance = createRedisClient()
  return redisInstance
}

export function getNeon() {
  if (!neonInstance) neonInstance = createNeonClient()
  return neonInstance
}

export function getBlob() {
  if (!blobInstance) blobInstance = createBlobClient()
  return blobInstance
}

export function getAI() {
  if (!aiInstance) aiInstance = createAIClient()
  return aiInstance
}