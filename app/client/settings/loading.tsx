export default function ClientSettingsLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>

      <div className="h-10 w-full bg-gray-200 rounded animate-pulse mb-6"></div>

      <div className="border rounded-lg p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-24 w-24 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="h-8 w-28 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="space-y-2">
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-gray-200"></div>

        <div className="space-y-4">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>

          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
