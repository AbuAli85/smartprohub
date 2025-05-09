import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/ui/mobile-nav"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">SmartPRO</span>
                <span className="text-sm text-gray-500 hidden sm:inline">Business Services Hub</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors"
              >
                Features
              </Link>
              <Link
                href="#services"
                className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors"
              >
                Services
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#contact"
                className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors"
              >
                Contact
              </Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors"
              >
                Sign In
              </Link>
              <Button className="bg-purple-600 hover:bg-purple-700">Get Started</Button>
            </div>

            <MobileNav />
          </div>
        </div>
      </header>

      {/* Rest of the content remains the same as in the previous file */}
      {/* ... */}
    </div>
  )
}
