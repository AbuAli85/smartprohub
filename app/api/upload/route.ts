import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { nanoid } from "nanoid"

export async function POST(request: Request) {
  const form = await request.formData()
  const file = form.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  try {
    // Generate a unique filename
    const fileExtension = file.name.split(".").pop()
    const uniqueFilename = `${nanoid()}.${fileExtension}`
    const pathname = `uploads/${uniqueFilename}`

    // Upload to Vercel Blob
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      size: blob.size,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
