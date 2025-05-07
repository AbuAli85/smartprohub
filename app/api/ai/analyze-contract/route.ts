import { NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: Request) {
  try {
    const { contractText } = await request.json()

    if (!contractText || contractText.trim().length === 0) {
      return NextResponse.json({ error: "Contract text is required" }, { status: 400 })
    }

    // Truncate if too long
    const truncatedText = contractText.slice(0, 15000)

    const prompt = `
You are a legal expert specializing in contract analysis. Analyze the following contract text and provide:
1. A brief summary (2-3 sentences)
2. A list of potential risks or concerning clauses
3. Recommendations for improvements
4. An overall score from 0-100 based on fairness, clarity, and legal protection

Contract text:
${truncatedText}

Format your response as JSON with the following structure:
{
  "summary": "Brief summary of the contract",
  "risks": ["Risk 1", "Risk 2", ...],
  "recommendations": ["Recommendation 1", "Recommendation 2", ...],
  "score": 75
}
`

    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      temperature: 0.2,
      maxTokens: 2000,
    })

    // Parse the JSON response
    try {
      const analysis = JSON.parse(text)
      return NextResponse.json(analysis)
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      return NextResponse.json({ error: "Failed to parse analysis results" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error analyzing contract:", error)
    return NextResponse.json({ error: "Failed to analyze contract" }, { status: 500 })
  }
}
