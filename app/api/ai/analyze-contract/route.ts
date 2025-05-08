import { NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: Request) {
  try {
    const { contractText } = await request.json()

    if (!contractText || contractText.trim().length === 0) {
      return NextResponse.json({ error: "Contract text is required" }, { status: 400 })
    }

    // Use Groq for AI-powered contract analysis
    const prompt = `
      You are a legal expert specializing in contract analysis. Analyze the following contract text and provide:
      1. A concise summary (2-3 sentences)
      2. A list of potential risks or concerns (up to 5 points)
      3. A list of recommendations for improvement (up to 5 points)
      4. An overall risk score from 0-100 (where 0 is extremely risky and 100 is very safe)

      Contract text:
      ${contractText}

      Format your response as JSON with the following structure:
      {
        "summary": "Summary text here",
        "risks": ["Risk 1", "Risk 2", ...],
        "recommendations": ["Recommendation 1", "Recommendation 2", ...],
        "score": 75
      }
    `

    try {
      const { text } = await generateText({
        model: groq("llama3-70b-8192"),
        prompt: prompt,
        temperature: 0.2,
        maxTokens: 1500,
      })

      // Parse the JSON response
      const analysisResult = JSON.parse(text)

      return NextResponse.json(analysisResult)
    } catch (aiError: any) {
      console.error("AI analysis error:", aiError)

      // Fallback to a simpler analysis if AI fails
      return NextResponse.json({
        summary: "Contract analysis was attempted but could not be completed. Please try again later.",
        risks: ["Unable to analyze risks at this time"],
        recommendations: ["Consider manual review by a legal professional"],
        score: 50,
      })
    }
  } catch (error: any) {
    console.error("Error analyzing contract:", error)
    return NextResponse.json({ error: "Failed to analyze contract" }, { status: 500 })
  }
}
