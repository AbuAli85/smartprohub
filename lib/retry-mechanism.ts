type RetryOptions = {
  maxRetries?: number
  delayMs?: number
  backoffFactor?: number
  retryableErrors?: string[]
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxRetries = 3, delayMs = 300, backoffFactor = 1.5, retryableErrors = [] } = options

  let lastError: any
  let currentDelay = delayMs

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add attempt number to performance tracking
      const startTime = performance.now()
      const result = await fn()
      const endTime = performance.now()

      // Log performance for successful attempts
      console.debug(`Operation succeeded on attempt ${attempt + 1}. Time: ${endTime - startTime}ms`)

      return result
    } catch (error: any) {
      lastError = error

      // Check if we should retry based on error message
      const shouldRetryError =
        retryableErrors.length === 0 || retryableErrors.some((errMsg) => error.message?.includes(errMsg))

      if (attempt < maxRetries && shouldRetryError) {
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${currentDelay}ms:`, error.message)
        await new Promise((resolve) => setTimeout(resolve, currentDelay))
        currentDelay = currentDelay * backoffFactor // Exponential backoff
      } else {
        break
      }
    }
  }

  throw lastError
}
