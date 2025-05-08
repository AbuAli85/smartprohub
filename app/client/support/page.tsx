"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock, HelpCircle, MessageSquare, Phone, Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ClientSupportPage() {
  const [activeTab, setActiveTab] = useState("tickets")
  const [ticketSubmitted, setTicketSubmitted] = useState(false)

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault()
    setTicketSubmitted(true)
    // Reset form after 3 seconds
    setTimeout(() => {
      setTicketSubmitted(false)
    }, 3000)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Support Center</h1>

      {ticketSubmitted && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Ticket Submitted</AlertTitle>
          <AlertDescription>
            Your support ticket has been submitted successfully. Our team will respond shortly.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Live Chat
            </CardTitle>
            <CardDescription>Chat with our support team</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-4">
              Connect instantly with our support representatives for quick assistance with your questions.
            </p>
            <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-600"></div>
              <span>Support agents available now</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Start Chat</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="bg-purple-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Support
            </CardTitle>
            <CardDescription>Call our support line</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-4">
              Speak directly with our support team for more complex issues requiring immediate attention.
            </p>
            <div className="text-lg font-medium mb-1">+1 (800) 555-1234</div>
            <p className="text-sm text-gray-500">Available Mon-Fri, 9am-5pm EST</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Request Callback
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="bg-amber-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Knowledge Base
            </CardTitle>
            <CardDescription>Find answers quickly</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-4">
              Browse our comprehensive knowledge base for tutorials, FAQs, and troubleshooting guides.
            </p>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="Search articles..." className="pl-9" />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Browse Articles
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="new">New Ticket</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Support Tickets</CardTitle>
              <CardDescription>Track and manage your support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "TKT-2025-001",
                    subject: "Billing discrepancy on October invoice",
                    date: "Oct 18, 2025",
                    status: "Open",
                  },
                  {
                    id: "TKT-2025-002",
                    subject: "Unable to access contract templates",
                    date: "Oct 10, 2025",
                    status: "In Progress",
                  },
                  {
                    id: "TKT-2025-003",
                    subject: "Question about service integration",
                    date: "Sep 28, 2025",
                    status: "Closed",
                  },
                ].map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block">
                        {ticket.status === "Open" && <AlertCircle className="h-5 w-5 text-red-500" />}
                        {ticket.status === "In Progress" && <Clock className="h-5 w-5 text-amber-500" />}
                        {ticket.status === "Closed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                      </div>
                      <div>
                        <div className="font-medium">{ticket.subject}</div>
                        <div className="text-sm text-gray-500">
                          {ticket.id} • {ticket.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          ticket.status === "Open"
                            ? "destructive"
                            : ticket.status === "In Progress"
                              ? "outline"
                              : "default"
                        }
                      >
                        {ticket.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit a New Support Ticket</CardTitle>
              <CardDescription>Provide details about your issue for faster resolution</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Brief description of your issue" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select defaultValue="billing">
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="billing">Billing & Payments</SelectItem>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="account">Account Management</SelectItem>
                      <SelectItem value="service">Service Question</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about your issue"
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attachment">Attachments (optional)</Label>
                  <Input id="attachment" type="file" />
                  <p className="text-xs text-gray-500">Max file size: 10MB. Supported formats: PDF, JPG, PNG</p>
                </div>

                <Button type="submit" className="w-full">
                  Submit Ticket
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
