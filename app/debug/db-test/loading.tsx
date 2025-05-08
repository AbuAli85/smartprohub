import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-8 w-64 mb-6" />
      <Skeleton className="h-4 w-full max-w-2xl mb-6" />
      <div className="space-y-4">
        <Skeleton className="h-[500px] w-full" />
      </div>
    </div>
  )
}
