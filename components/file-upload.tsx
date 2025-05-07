"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, FileText, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onUpload: (url: string, fileName: string) => void
  accept?: string
  maxSize?: number // in MB
  className?: string
}

export function FileUpload({ onUpload, accept = "application/pdf,image/*", maxSize = 5, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Reset states
    setError(null)
    setFileName(file.name)

    // Validate file type
    if (!file.type.match(accept.replace(/,/g, "|").replace(/\*/g, ".*"))) {
      setError(`Invalid file type. Please upload ${accept.split(",").join(" or ")}`)
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSize}MB`)
      return
    }

    // Start upload
    setIsUploading(true)
    setProgress(0)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Simulate progress (in a real app, you'd get this from your upload API)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 100)

      // Upload to Blob
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      setProgress(100)

      // Call the onUpload callback with the URL
      onUpload(data.url, file.name)

      // Reset after a short delay
      setTimeout(() => {
        setIsUploading(false)
        setProgress(0)
      }, 1000)
    } catch (err: any) {
      setError(err.message || "Upload failed")
      setIsUploading(false)
    }
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed border-gray-300 p-6 transition-all",
        isDragging && "border-primary bg-primary/5",
        isUploading && "border-primary",
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="sr-only"
        onChange={handleFileChange}
        accept={accept}
        disabled={isUploading}
      />

      <div className="flex flex-col items-center justify-center space-y-3 text-center">
        {isUploading ? (
          <>
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">{fileName}</p>
              <Progress value={progress} className="h-2 w-full max-w-xs" />
              <p className="text-xs text-muted-foreground">{progress}% uploaded</p>
            </div>
          </>
        ) : progress === 100 ? (
          <>
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Upload complete!</p>
              <p className="text-sm text-muted-foreground">{fileName}</p>
            </div>
            <label htmlFor="file-upload">
              <Button variant="outline" size="sm" className="mt-2">
                Upload another
              </Button>
            </label>
          </>
        ) : (
          <>
            <div className="rounded-full bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Drag and drop your file here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
            </div>
            <label htmlFor="file-upload">
              <Button variant="outline" size="sm">
                Select file
              </Button>
            </label>
            <p className="text-xs text-muted-foreground">
              Max file size: {maxSize}MB. Supported formats: {accept.split(",").join(", ")}
            </p>
          </>
        )}

        {error && (
          <div className="mt-2 flex items-center text-sm text-red-500">
            <X className="mr-1 h-4 w-4" />
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
