import { NextResponse } from "next/server"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

export async function GET() {
  try {
    // Simple test prompt
    const { text } = await generateText({
      model: xai("Grok-1"),
      prompt: "Write a single sentence confirming that the Grok integration is working.",
      maxTokens: 100,
    })

    return NextResponse.json({
      status: "success",
      message: "Grok integration successful",
      response: text,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Grok test failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
