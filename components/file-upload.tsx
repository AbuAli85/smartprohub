"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Upload, X, FileText, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface FileUploadProps {
  onUploadComplete?: (fileUrl: string, fileData: any) => void
  acceptedFileTypes?: string
  maxSizeMB?: number
  buttonText?: string
  className?: string
}

export function FileUpload({
  onUploadComplete,
  acceptedFileTypes = ".pdf,.doc,.docx,.txt",
  maxSizeMB = 10,
  buttonText = "Upload File",
  className = "",
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)
    setSuccess(false)

    if (!selectedFile) return

    // Validate file size
    if (selectedFile.size > maxSizeBytes) {
      setError(`File size exceeds the maximum limit of ${maxSizeMB}MB`)
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)
    setError(null)
    setSuccess(false)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = Math.min(prev + 5, 90)
          return newProgress
        })
      }, 100)

      // Upload file to Vercel Blob
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      setProgress(100)
      setSuccess(true)

      const data = await response.json()

      if (onUploadComplete) {
        onUploadComplete(data.url, data)
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during upload")
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setProgress(0)
    setError(null)
    setSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {!file ? (
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select a file to upload</Label>
          <Input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept={acceptedFileTypes}
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            Accepted file types: {acceptedFileTypes.replace(/\./g, "").replace(/,/g, ", ")}. Maximum size: {maxSizeMB}MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium truncate max-w-[200px]">{file.name}</span>
              <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)}MB)</span>
            </div>
            <Button variant="ghost" size="icon" onClick={resetUpload} disabled={uploading}>
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">Uploading... {progress}%</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">File uploaded successfully!</AlertDescription>
            </Alert>
          )}

          {!uploading && !success && (
            <Button onClick={handleUpload} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              {buttonText}
            </Button>
          )}

          {success && (
            <Button variant="outline" onClick={resetUpload} className="w-full">
              Upload Another File
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
