import { enhancedRedis, isRedisAvailable } from "@/lib/redis/enhanced-client"

// Cache options
export interface CacheOptions {
  expirationSeconds?: number
  expirationMinutes?: number
  useLocalStorageFallback?: boolean
}

// Default cache options
const DEFAULT_OPTIONS: CacheOptions = {
  expirationMinutes: 60, // 1 hour default
  useLocalStorageFallback: true,
}

// Check if we're in a browser environment
const isBrowser = () => typeof window !== "undefined"

/**
 * Set a value in the cache (Redis with localStorage fallback)
 */
export async function setCache<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Calculate expiration in seconds
  const expirationSeconds = opts.expirationSeconds || (opts.expirationMinutes ? opts.expirationMinutes * 60 : undefined)

  // Try Redis first
  const redisAvailable = await isRedisAvailable()
  if (redisAvailable) {
    return await enhancedRedis.set(key, value, expirationSeconds)
  }

  // Fall back to localStorage if enabled and in browser
  if (opts.useLocalStorageFallback && isBrowser()) {
    try {
      const item = {
        value,
        expires: expirationSeconds ? Date.now() + expirationSeconds * 1000 : null,
      }
      localStorage.setItem(key, JSON.stringify(item))
      return true
    } catch (error) {
      console.error(`localStorage setItem error for key ${key}:`, error)
      return false
    }
  }

  return false
}

/**
 * Get a value from the cache (Redis with localStorage fallback)
 */
export async function getCache<T>(key: string): Promise<T | null> {
  // Try Redis first
  const redisAvailable = await isRedisAvailable()
  if (redisAvailable) {
    return await enhancedRedis.get<T>(key)
  }

  // Fall back to localStorage if in browser
  if (isBrowser()) {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      const parsed = JSON.parse(item)

      // Check if expired
      if (parsed.expires && parsed.expires < Date.now()) {
        localStorage.removeItem(key)
        return null
      }

      return parsed.value as T
    } catch (error) {
      console.error(`localStorage getItem error for key ${key}:`, error)
      return null
    }
  }

  return null
}

/**
 * Remove a value from the cache
 */
export async function removeCache(key: string): Promise<boolean> {
  let success = true

  // Try Redis
  const redisAvailable = await isRedisAvailable()
  if (redisAvailable) {
    success = await enhancedRedis.del(key)
  }

  // Also remove from localStorage if in browser
  if (isBrowser()) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`localStorage removeItem error for key ${key}:`, error)
      success = false
    }
  }

  return success
}

/**
 * Check if a key exists in the cache
 */
export async function hasCache(key: string): Promise<boolean> {
  // Try Redis first
  const redisAvailable = await isRedisAvailable()
  if (redisAvailable) {
    return await enhancedRedis.exists(key)
  }

  // Fall back to localStorage if in browser
  if (isBrowser()) {
    try {
      const item = localStorage.getItem(key)
      if (!item) return false

      const parsed = JSON.parse(item)

      // Check if expired
      if (parsed.expires && parsed.expires < Date.now()) {
        localStorage.removeItem(key)
        return false
      }

      return true
    } catch (error) {
      console.error(`localStorage check error for key ${key}:`, error)
      return false
    }
  }

  return false
}

/**
 * Clear all cache entries with a specific prefix
 */
export async function clearCacheByPrefix(prefix: string): Promise<boolean> {
  // For localStorage, we can iterate through keys
  if (isBrowser()) {
    try {
      const keysToRemove: string[] = []

      // Find all keys with the prefix
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key)
        }
      }

      // Remove all matching keys
      keysToRemove.forEach((key) => localStorage.removeItem(key))
    } catch (error) {
      console.error(`Error clearing cache with prefix ${prefix}:`, error)
      return false
    }
  }

  // For Redis, this is more complex and would require a SCAN command
  // This is a simplified implementation
  return true
}
