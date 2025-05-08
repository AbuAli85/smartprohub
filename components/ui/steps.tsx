import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle } from "lucide-react"

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number
}

export function Steps({ currentStep, className, ...props }: StepsProps) {
  const childrenArray = React.Children.toArray(props.children)
  const steps = childrenArray.filter((child) => {
    return React.isValidElement(child) && child.type === Step
  })

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {React.Children.map(steps, (step, index) => {
        if (React.isValidElement(step)) {
          return React.cloneElement(step, {
            stepNumber: index + 1,
            isActive: currentStep === index,
            isCompleted: currentStep > index,
          })
        }
        return step
      })}
    </div>
  )
}

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  stepNumber?: number
  isActive?: boolean
  isCompleted?: boolean
}

export function Step({ title, description, stepNumber, isActive, isCompleted, className, ...props }: StepProps) {
  return (
    <div
      className={cn("flex items-start space-x-4 p-4 rounded-lg transition-colors", isActive && "bg-muted", className)}
      {...props}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-center",
          isActive && "border-primary bg-primary text-primary-foreground",
          isCompleted && "border-primary bg-primary text-primary-foreground",
        )}
      >
        {isCompleted ? <CheckCircle className="h-4 w-4" /> : <span className="text-sm">{stepNumber}</span>}
      </div>
      <div className="flex-1">
        <h3 className={cn("text-base font-medium", isActive && "text-primary")}>{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}
