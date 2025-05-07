"use client"

import { useEffect } from "react"

export default function GlobalStyles() {
  useEffect(() => {
    // This is a client-side only effect to ensure CSS is loaded properly
    const linkElement = document.createElement("link")
    linkElement.rel = "stylesheet"
    linkElement.href = "/_next/static/css/app/layout.css"
    document.head.appendChild(linkElement)

    return () => {
      document.head.removeChild(linkElement)
    }
  }, [])

  return null
}
