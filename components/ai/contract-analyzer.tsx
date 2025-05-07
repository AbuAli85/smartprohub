"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ContractAnalyzerProps {
  contractText: string
  onAnalysisComplete?: (analysis: ContractAnalysis) => void
}

export interface ContractAnalysis {
  summary: string
  risks: string[]
  recommendations: string[]
  score: number
}

export function ContractAnalyzer({ contractText, onAnalysisComplete }: ContractAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeContract = async () => {
    if (!contractText.trim()) {
      setError("Please provide contract text to analyze")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/analyze-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contractText }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze contract")
      }

      const data = await response.json()
      setAnalysis(data)

      if (onAnalysisComplete) {
        onAnalysisComplete(data)
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Contract Analysis
        </CardTitle>
        <CardDescription>AI-powered analysis of your contract terms and conditions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!analysis ? (
          <div className="space-y-4">
            <Textarea
              placeholder="Paste your contract text here or upload a document"
              value={contractText}
              readOnly
              className="min-h-[200px]"
            />
            <Button onClick={analyzeContract} disabled={isAnalyzing || !contractText.trim()}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Contract"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Summary</h3>
              <p className="text-sm text-muted-foreground">{analysis.summary}</p>
            </div>

            <div>
              <h3 className="font-medium">Risk Assessment</h3>
              <div className="mt-2 space-y-2">
                {analysis.risks.map((risk, index) => (
                  <Alert key={index} variant="destructive" className="py-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="ml-2 text-sm">{risk}</AlertDescription>
                  </Alert>
                ))}
                {analysis.risks.length === 0 && (
                  <p className="text-sm text-muted-foreground">No significant risks detected.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium">Recommendations</h3>
              <div className="mt-2 space-y-2">
                {analysis.recommendations.map((recommendation, index) => (
                  <Alert key={index} className="py-2 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="ml-2 text-sm">{recommendation}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium">Overall Score</h3>
              <div className="mt-2 flex items-center">
                <div className="relative h-4 w-full rounded-full bg-gray-200">
                  <div
                    className={`absolute left-0 top-0 h-4 rounded-full ${
                      analysis.score > 70 ? "bg-green-500" : analysis.score > 40 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>
                <span className="ml-2 font-medium">{analysis.score}/100</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {analysis && (
          <Button variant="outline" onClick={() => setAnalysis(null)}>
            Analyze Another Contract
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
