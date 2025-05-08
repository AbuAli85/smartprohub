import { Skeleton } from "@/components/ui/skeleton"

export default function MessagesLoading() {
  return (
    <div className="container mx-auto py-6">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="border rounded-lg">
        <div className="border-b p-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="h-[500px] p-4">
          <div className="space-y-4">
            <div className="flex justify-start">
              <div className="flex items-start max-w-[80%]">
                <Skeleton className="h-8 w-8 rounded-full mr-2" />
                <div>
                  <Skeleton className="h-20 w-64 rounded-lg" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <div>
                <Skeleton className="h-16 w-56 rounded-lg" />
                <Skeleton className="h-4 w-24 mt-1 ml-auto" />
              </div>
            </div>
          </div>
        </div>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}
