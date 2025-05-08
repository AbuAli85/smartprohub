import { Skeleton } from "@/components/ui/skeleton"

export default function ClientSupportLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-10 w-64 mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <div className="p-6 border-b space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="p-6 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="p-6 border-t">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 mb-6">
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="border rounded-lg p-6">
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-60 mb-6" />

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32 mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
