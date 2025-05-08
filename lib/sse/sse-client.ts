"use client"

import { useEffect, useState } from "react"

type SSEOptions = {
  onOpen?: () => void
  onMessage?: (event: MessageEvent) => void
  onError?: (error: Event) => void
  onReconnect?: () => void
  maxRetries?: number
  retryInterval?: number
}

export function useSSE(url: string, options: SSEOptions = {}) {
  const [eventSource, setEventSource] = useState<EventSource | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastEventId, setLastEventId] = useState<string | null>(null)

  const { onOpen, onMessage, onError, onReconnect, maxRetries = 5, retryInterval = 3000 } = options

  const connect = () => {
    // Close existing connection if any
    if (eventSource) {
      eventSource.close()
    }

    // Add last event ID if available for resuming
    const fullUrl = lastEventId ? `${url}${url.includes("?") ? "&" : "?"}lastEventId=${lastEventId}` : url

    const newEventSource = new EventSource(fullUrl)

    newEventSource.onopen = () => {
      setIsConnected(true)
      setRetryCount(0)
      if (onOpen) onOpen()
    }

    newEventSource.onmessage = (event) => {
      setLastEventId(event.lastEventId || null)
      if (onMessage) onMessage(event)
    }

    newEventSource.onerror = (error) => {
      setIsConnected(false)
      newEventSource.close()

      if (onError) onError(error)

      // Attempt to reconnect if we haven't exceeded max retries
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1)
          if (onReconnect) onReconnect()
          connect()
        }, retryInterval)
      }
    }

    setEventSource(newEventSource)
  }

  useEffect(() => {
    connect()

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [url]) // Reconnect if URL changes

  return {
    isConnected,
    retryCount,
    disconnect: () => {
      if (eventSource) {
        eventSource.close()
        setIsConnected(false)
      }
    },
    reconnect: connect,
  }
}
