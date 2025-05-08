import { NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function GET() {
  try {
    // Simple test prompt
    const { text } = await generateText({
      model: groq("llama3-8b-8192"),
      prompt: "Write a single sentence confirming that the AI integration is working.",
      maxTokens: 100,
    })

    return NextResponse.json({
      status: "success",
      message: "AI integration successful",
      response: text,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "AI test failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
