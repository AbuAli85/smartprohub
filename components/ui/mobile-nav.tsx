"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex justify-end p-4">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close menu">
              <X className="h-6 w-6" />
            </Button>
          </div>

          <nav className="flex flex-col items-center space-y-6 p-4">
            <Link
              href="#features"
              className="text-lg font-medium text-gray-900 hover:text-purple-700"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#services"
              className="text-lg font-medium text-gray-900 hover:text-purple-700"
              onClick={() => setIsOpen(false)}
            >
              Services
            </Link>
            <Link
              href="#pricing"
              className="text-lg font-medium text-gray-900 hover:text-purple-700"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="#contact"
              className="text-lg font-medium text-gray-900 hover:text-purple-700"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-6 w-full flex flex-col space-y-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
