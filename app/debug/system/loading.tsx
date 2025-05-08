import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="h-8 w-64 mb-6" />
      <Skeleton className="h-[600px] w-full rounded-lg" />
    </div>
  )
}
