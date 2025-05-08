"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ThumbsUp, Star } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

type FeedbackType = "bug" | "feature" | "general"

export default function FeedbackForm() {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("general")
  const [rating, setRating] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !description.trim() || rating === null) {
      toast({
        title: "Incomplete form",
        description: "Please fill in all fields and provide a rating",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      // Submit feedback
      const { error } = await supabase.from("feedback").insert({
        user_id: user.id,
        type: feedbackType,
        title: title,
        description: description,
        rating: rating,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
        variant: "default",
      })

      // Reset form and show success message
      setFeedbackType("general")
      setRating(null)
      setTitle("")
      setDescription("")
      setSubmitted(true)
    } catch (error: any) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error submitting feedback",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Feedback</CardTitle>
        <CardDescription>Help us improve by sharing your experience with the platform</CardDescription>
      </CardHeader>

      {submitted ? (
        <CardContent className="pt-6 text-center">
          <div className="flex flex-col items-center justify-center py-6">
            <ThumbsUp className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-xl font-medium">Thank you for your feedback!</h3>
            <p className="text-muted-foreground mt-2 mb-6">Your input helps us improve the platform for everyone.</p>
            <Button onClick={handleReset}>Submit Another Feedback</Button>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Feedback Type</Label>
              <RadioGroup
                value={feedbackType}
                onValueChange={(value) => setFeedbackType(value as FeedbackType)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bug" id="bug" />
                  <Label htmlFor="bug">Bug Report</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="feature" id="feature" />
                  <Label htmlFor="feature">Feature Request</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="general" id="general" />
                  <Label htmlFor="general">General Feedback</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={rating === value ? "default" : "outline"}
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setRating(value)}
                  >
                    <Star
                      className={`h-5 w-5 ${rating !== null && value <= rating ? "fill-current text-yellow-500" : ""}`}
                    />
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief summary of your feedback"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Please provide details about your feedback..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}
