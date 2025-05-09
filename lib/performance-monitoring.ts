type PerformanceMetric = {
  operation: string
  startTime: number
  endTime?: number
  duration?: number
  success?: boolean
  error?: string
}

const metrics: PerformanceMetric[] = []
const SLOW_THRESHOLD_MS = 1000 // 1 second threshold for slow operations

export function startMeasure(operation: string): PerformanceMetric {
  const metric: PerformanceMetric = {
    operation,
    startTime: performance.now(),
  }

  metrics.push(metric)
  return metric
}

export function endMeasure(metric: PerformanceMetric, success = true, error?: string): void {
  metric.endTime = performance.now()
  metric.duration = metric.endTime - metric.startTime
  metric.success = success
  metric.error = error

  // Log slow operations
  if (metric.duration > SLOW_THRESHOLD_MS) {
    console.warn(`Slow operation detected: ${metric.operation} took ${metric.duration.toFixed(2)}ms`)

    // In a real app, you might send this to an analytics service
    if (typeof window !== "undefined" && window.navigator.onLine) {
      // Example: sendToAnalyticsService(metric);
    }
  }

  // Log all operations in development
  if (process.env.NODE_ENV === "development") {
    console.debug(
      `Performance: ${metric.operation} - ${metric.duration?.toFixed(2)}ms - ${success ? "Success" : "Failed"}`,
    )
  }
}

export function getMetrics(): PerformanceMetric[] {
  return [...metrics]
}

export function clearMetrics(): void {
  metrics.length = 0
}

// Helper function to measure an async function
export async function measure<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  const metric = startMeasure(operation)
  try {
    const result = await fn()
    endMeasure(metric, true)
    return result
  } catch (error: any) {
    endMeasure(metric, false, error.message)
    throw error
  }
}
