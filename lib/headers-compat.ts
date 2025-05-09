// This file provides compatibility for headers between App Router and Pages Router

// For client components
export function getClientHeaders() {
  // Client-side implementation that doesn't rely on next/headers
  return typeof window !== "undefined" ? new Headers(window.headers) : new Headers()
}

// For server components in Pages Router
export function getServerHeaders(req?: any) {
  if (req && req.headers) {
    // Convert req.headers object to Headers instance
    const headers = new Headers()
    Object.entries(req.headers).forEach(([key, value]) => {
      if (typeof value === "string") {
        headers.append(key, value)
      } else if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v))
      }
    })
    return headers
  }
  return new Headers()
}

// For cookies
export function getClientCookies() {
  // Client-side implementation that doesn't rely on next/headers
  return typeof document !== "undefined" ? document.cookie : ""
}

export function getServerCookies(req?: any) {
  if (req && req.cookies) {
    return req.cookies
  }
  return {}
}
