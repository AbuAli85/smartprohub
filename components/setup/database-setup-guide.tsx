"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Steps, Step } from "@/components/ui/steps"
import { Button } from "@/components/ui/button"
import { AlertCircle, Database, ArrowRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function DatabaseSetupGuide() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const action = searchParams.get("action")

  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (action === "create-tables") {
      setCurrentStep(1)
    }
  }, [action])

  const steps = [
    {
      title: "Test Connection",
      description: "Verify your database connection is working properly",
      href: "/setup/database?action=test-connection",
    },
    {
      title: "Create Tables",
      description: "Set up the required database tables for your application",
      href: "/setup/database?action=create-tables",
    },
    {
      title: "Fix Columns",
      description: "Add any missing columns to your database tables",
      href: "/setup/database?action=fix-columns",
    },
    {
      title: "Fix Policies",
      description: "Update any incorrect RLS policies in your database",
      href: "/setup/database?action=fix-policies",
    },
    {
      title: "Seed Data",
      description: "Add sample data to your database for testing",
      href: "/setup/database?action=seed-data",
    },
  ]

  const handleStepClick = (index: number) => {
    setCurrentStep(index)
    router.push(steps[index].href)
  }

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Setup Guide
        </CardTitle>
        <CardDescription>Follow these steps to set up your database correctly</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            These steps must be completed in order. Make sure each step is successful before moving to the next one.
          </AlertDescription>
        </Alert>

        <Steps currentStep={currentStep} className="mt-4">
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              onClick={() => handleStepClick(index)}
              className="cursor-pointer"
            />
          ))}
        </Steps>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" disabled={currentStep === 0} onClick={() => handleStepClick(currentStep - 1)}>
          Previous Step
        </Button>
        <Button disabled={currentStep === steps.length - 1} onClick={() => handleStepClick(currentStep + 1)}>
          Next Step <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
