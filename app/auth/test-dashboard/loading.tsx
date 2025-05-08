export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}
