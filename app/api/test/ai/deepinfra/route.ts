import { NextResponse } from "next/server"
import { generateText } from "ai"
import { deepinfra } from "@ai-sdk/deepinfra"

export async function GET() {
  try {
    // Simple test prompt
    const { text } = await generateText({
      model: deepinfra("meta-llama/Llama-3-8b-chat-hf"),
      prompt: "Write a single sentence confirming that the DeepInfra integration is working.",
      maxTokens: 100,
    })

    return NextResponse.json({
      status: "success",
      message: "DeepInfra integration successful",
      response: text,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "DeepInfra test failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
