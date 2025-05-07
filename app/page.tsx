import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart, Calendar, FileText, MessageSquare, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">SmartPRO</h1>
            <span className="text-sm text-muted-foreground">Business Services Hub</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-sm font-medium hover:underline">
              Features
            </Link>
            <Link href="#services" className="text-sm font-medium hover:underline">
              Services
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline">
              Pricing
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:underline">
              Contact
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Streamline Your Business Operations</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              SmartPRO provides a comprehensive platform for managing clients, bookings, contracts, and more, all in one
              place.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Book a Demo
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold mb-12 text-center">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm">
                <Calendar className="h-12 w-12 text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Booking Management</h4>
                <p className="text-gray-600">
                  Efficiently manage appointments and bookings with an intuitive calendar interface.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm">
                <FileText className="h-12 w-12 text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Contract Handling</h4>
                <p className="text-gray-600">
                  Create, manage, and track contracts with clients and partners seamlessly.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm">
                <MessageSquare className="h-12 w-12 text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Client Communication</h4>
                <p className="text-gray-600">Keep all client communications organized in one centralized platform.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm">
                <Users className="h-12 w-12 text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Team Collaboration</h4>
                <p className="text-gray-600">
                  Collaborate with your team members efficiently with role-based access control.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm">
                <BarChart className="h-12 w-12 text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Analytics & Reporting</h4>
                <p className="text-gray-600">
                  Gain insights into your business performance with comprehensive analytics.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm">
                <Calendar className="h-12 w-12 text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Availability Management</h4>
                <p className="text-gray-600">Set your availability and let clients book appointments accordingly.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold mb-12 text-center">Our Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h4 className="text-xl font-semibold mb-3">Business Consultation</h4>
                <p className="text-gray-600 mb-4">
                  Expert advice on business strategy, operations, and growth opportunities.
                </p>
                <Button variant="outline">Learn More</Button>
              </div>
              <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h4 className="text-xl font-semibold mb-3">Financial Planning</h4>
                <p className="text-gray-600 mb-4">
                  Comprehensive financial planning services for businesses of all sizes.
                </p>
                <Button variant="outline">Learn More</Button>
              </div>
              <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h4 className="text-xl font-semibold mb-3">Marketing Strategy</h4>
                <p className="text-gray-600 mb-4">
                  Develop effective marketing strategies to reach your target audience.
                </p>
                <Button variant="outline">Learn More</Button>
              </div>
              <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h4 className="text-xl font-semibold mb-3">Legal Consultation</h4>
                <p className="text-gray-600 mb-4">Expert legal advice for business contracts, compliance, and more.</p>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold mb-12 text-center">Pricing Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 border rounded-lg shadow-sm">
                <h4 className="text-xl font-semibold mb-2">Basic</h4>
                <p className="text-3xl font-bold mb-4">
                  $29<span className="text-sm font-normal text-gray-600">/month</span>
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Up to 10 clients
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Basic booking management
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Simple contract templates
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg
                      className="h-5 w-5 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                    Advanced analytics
                  </li>
                </ul>
                <Button className="w-full">Get Started</Button>
              </div>
              <div className="p-6 border rounded-lg shadow-sm bg-blue-50 border-blue-200 relative">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  POPULAR
                </div>
                <h4 className="text-xl font-semibold mb-2">Professional</h4>
                <p className="text-3xl font-bold mb-4">
                  $79<span className="text-sm font-normal text-gray-600">/month</span>
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Up to 50 clients
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Advanced booking management
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Custom contract templates
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Basic analytics
                  </li>
                </ul>
                <Button className="w-full">Get Started</Button>
              </div>
              <div className="p-6 border rounded-lg shadow-sm">
                <h4 className="text-xl font-semibold mb-2">Enterprise</h4>
                <p className="text-3xl font-bold mb-4">
                  $199<span className="text-sm font-normal text-gray-600">/month</span>
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Unlimited clients
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Premium booking management
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Advanced contract management
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Advanced analytics & reporting
                  </li>
                </ul>
                <Button className="w-full">Contact Sales</Button>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold mb-12 text-center">Contact Us</h3>
            <div className="max-w-2xl mx-auto">
              <form className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Your email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Subject" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Your message" rows={5} />
                </div>
                <Button className="w-full sm:w-auto">Send Message</Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h4 className="text-lg font-bold mb-4">SmartPRO</h4>
              <p className="text-gray-400">
                Your complete business services solution for managing clients, bookings, and more.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="text-gray-400 hover:text-white">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-gray-400 hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="text-gray-400 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} SmartPRO Business Services Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
