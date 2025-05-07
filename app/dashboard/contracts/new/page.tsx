"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePicker } from "@/components/ui/date-picker"
import { FileUpload } from "@/components/file-upload"
import { ContractAnalyzer, type ContractAnalysis } from "@/components/ai/contract-analyzer"
import { Loader2, FileText, Upload, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth/auth-provider"
import { format } from "date-fns"

export default function NewContractPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("create")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [contractAnalysis, setContractAnalysis] = useState<ContractAnalysis | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    startDate: new Date(),
    endDate: null as Date | null,
    content: "",
    value: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (field: "startDate" | "endDate", date: Date | null) => {
    setFormData((prev) => ({ ...prev, [field]: date }))
  }

  const handleFileUpload = (url: string, fileName: string) => {
    setUploadedFileUrl(url)
    setUploadedFileName(fileName)
    // In a real app, you might want to extract text from the document here
  }

  const handleAnalysisComplete = (analysis: ContractAnalysis) => {
    setContractAnalysis(analysis)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Create form data for submission
      const submitData = {
        title: formData.title,
        clientName: formData.clientName,
        startDate: formData.startDate ? format(formData.startDate, "yyyy-MM-dd") : null,
        endDate: formData.endDate ? format(formData.endDate, "yyyy-MM-dd") : null,
        content: formData.content,
        value: Number.parseFloat(formData.value) || 0,
        userId: user?.id,
        documentUrl: uploadedFileUrl,
        documentName: uploadedFileName,
        analysis: contractAnalysis,
      }

      // Submit to API
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        throw new Error("Failed to create contract")
      }

      // Redirect to contracts list
      router.push("/dashboard/contracts")
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the contract")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-6 text-3xl font-bold tracking-tight">New Contract</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Contract</TabsTrigger>
          <TabsTrigger value="upload" disabled={!uploadedFileUrl}>
            Upload & Analyze
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
                <CardDescription>Create a new contract for your client</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Contract Title</Label>
                    <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <DatePicker date={formData.startDate} setDate={(date) => handleDateChange("startDate", date)} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <DatePicker date={formData.endDate} setDate={(date) => handleDateChange("endDate", date)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Contract Value ($)</Label>
                    <Input id="value" name="value" type="number" value={formData.value} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Contract Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={12}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Upload Contract Document (Optional)</Label>
                  <FileUpload onUpload={handleFileUpload} accept=".pdf,.docx,.doc" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Contract"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Uploaded Document
                </CardTitle>
                <CardDescription>Review your uploaded contract document</CardDescription>
              </CardHeader>
              <CardContent>
                {uploadedFileUrl && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="rounded-md border p-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{uploadedFileName}</p>
                          <p className="text-xs text-muted-foreground">Uploaded successfully</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(uploadedFileUrl, "_blank")}>
                        View Document
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedFileUrl(null)
                          setUploadedFileName(null)
                          setActiveTab("create")
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <ContractAnalyzer contractText={formData.content} onAnalysisComplete={handleAnalysisComplete} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
