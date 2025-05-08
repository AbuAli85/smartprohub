import { NextResponse } from "next/server"
import { list } from "@vercel/blob"

export async function GET() {
  try {
    // List blobs to test connection
    const blobs = await list()

    return NextResponse.json({
      status: "success",
      message: "Blob connection successful",
      blobCount: blobs.blobs.length,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Blob test failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
