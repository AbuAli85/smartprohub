export default function ClientBillingLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="border rounded-lg p-4 space-y-6">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                <div>
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-1"></div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
