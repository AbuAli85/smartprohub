"use client"

import { useEffect, useState, useCallback } from "react"

type SSEOptions = {
  onOpen?: () => void
  onMessage?: (event: MessageEvent) => void
  onError?: (error: Event) => void
  onReconnect?: () => void
  maxRetries?: number
  retryInterval?: number
}

export function useSSE(url: string | null, options: SSEOptions = {}) {
  const [eventSource, setEventSource] = useState<EventSource | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastEventId, setLastEventId] = useState<string | null>(null)

  const { onOpen, onMessage, onError, onReconnect, maxRetries = 5, retryInterval = 3000 } = options

  const connect = useCallback(() => {
    // Don't attempt to connect if URL is null
    if (!url) {
      console.log("SSE URL is null, not connecting")
      return
    }

    // Close existing connection if any
    if (eventSource) {
      console.log("Closing existing SSE connection")
      eventSource.close()
    }

    // Add last event ID if available for resuming
    const fullUrl = lastEventId ? `${url}${url.includes("?") ? "&" : "?"}lastEventId=${lastEventId}` : url

    console.log(`Connecting to SSE endpoint: ${fullUrl}`)

    try {
      const newEventSource = new EventSource(fullUrl)

      newEventSource.onopen = () => {
        console.log("SSE connection opened successfully")
        setIsConnected(true)
        setRetryCount(0)
        if (onOpen) onOpen()
      }

      newEventSource.onmessage = (event) => {
        console.log("SSE message received:", event)
        setLastEventId(event.lastEventId || null)
        if (onMessage) onMessage(event)
      }

      newEventSource.onerror = (error) => {
        console.error("SSE connection error:", error)
        setIsConnected(false)
        newEventSource.close()

        if (onError) onError(error)

        // Attempt to reconnect if we haven't exceeded max retries
        if (retryCount < maxRetries) {
          console.log(`Attempting to reconnect (${retryCount + 1}/${maxRetries})...`)
          setTimeout(() => {
            setRetryCount((prev) => prev + 1)
            if (onReconnect) onReconnect()
            connect()
          }, retryInterval)
        } else {
          console.error(`Maximum retry attempts (${maxRetries}) reached. Giving up.`)
        }
      }

      setEventSource(newEventSource)
    } catch (error) {
      console.error("Error creating EventSource:", error)
    }
  }, [url, lastEventId, eventSource, retryCount, onOpen, onMessage, onError, onReconnect, maxRetries, retryInterval])

  useEffect(() => {
    connect()

    return () => {
      if (eventSource) {
        console.log("Cleaning up SSE connection")
        eventSource.close()
      }
    }
  }, [connect])

  return {
    isConnected,
    retryCount,
    disconnect: useCallback(() => {
      if (eventSource) {
        eventSource.close()
        setIsConnected(false)
      }
    }, [eventSource]),
    reconnect: connect,
  }
}
