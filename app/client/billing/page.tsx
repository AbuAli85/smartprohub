"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, CreditCard, Download, FileText, Receipt } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ClientBillingPage() {
  const [activeTab, setActiveTab] = useState("invoices")
  const [paymentStatus, setPaymentStatus] = useState<"success" | "pending" | null>(null)

  const handlePayment = () => {
    setPaymentStatus("pending")
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus("success")
    }, 2000)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Billing & Payments</h1>

      {paymentStatus === "success" && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Payment Successful</AlertTitle>
          <AlertDescription>
            Your payment has been processed successfully. A receipt has been sent to your email.
          </AlertDescription>
        </Alert>
      )}

      {paymentStatus === "pending" && (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-600">Processing Payment</AlertTitle>
          <AlertDescription>Your payment is being processed. Please do not refresh the page.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold">Business Pro</span>
              <Badge className="bg-green-600">Active</Badge>
            </div>
            <p className="text-sm text-gray-500 mb-4">Renews on November 15, 2025</p>
            <div className="text-2xl font-bold mb-2">$49.99/month</div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Manage Subscription
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Your default payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-8 w-8 text-gray-400" />
              <div>
                <div className="font-medium">Visa ending in 4242</div>
                <div className="text-sm text-gray-500">Expires 09/2026</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Update Payment Method
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Summary</CardTitle>
            <CardDescription>Current billing period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subscription</span>
                <span>$49.99</span>
              </div>
              <div className="flex justify-between">
                <span>Additional Services</span>
                <span>$10.00</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>$6.00</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>$65.99</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handlePayment}>
              Pay Now
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>View and download your invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "INV-2025-001", date: "Oct 15, 2025", amount: "$65.99", status: "Paid" },
                  { id: "INV-2025-002", date: "Sep 15, 2025", amount: "$65.99", status: "Paid" },
                  { id: "INV-2025-003", date: "Aug 15, 2025", amount: "$65.99", status: "Paid" },
                ].map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{invoice.id}</div>
                        <div className="text-sm text-gray-500">{invoice.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>{invoice.amount}</span>
                      <Badge variant={invoice.status === "Paid" ? "default" : "outline"}>{invoice.status}</Badge>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Your payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "TRX-2025-001", date: "Oct 15, 2025", amount: "$65.99", method: "Visa •••• 4242" },
                  { id: "TRX-2025-002", date: "Sep 15, 2025", amount: "$65.99", method: "Visa •••• 4242" },
                  { id: "TRX-2025-003", date: "Aug 15, 2025", amount: "$65.99", method: "Visa •••• 4242" },
                ].map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Receipt className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{transaction.id}</div>
                        <div className="text-sm text-gray-500">{transaction.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>{transaction.amount}</span>
                      <span className="text-sm text-gray-500">{transaction.method}</span>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
