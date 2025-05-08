import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function FixMissingTablesLoading() {
  return (
    <div className="container mx-auto py-10">
      <Skeleton className="mb-6 h-10 w-64" />
      <Skeleton className="mb-8 h-5 w-full" />

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>

            <div className="rounded-md border p-4">
              <Skeleton className="mb-2 h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <div className="mt-2 space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-40" />
        </CardFooter>
      </Card>
    </div>
  )
}
