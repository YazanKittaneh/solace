import { LoadingSpinner, Skeleton } from '@/components/LoadingStates';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page header skeleton */}
      <div className="mb-8">
        <Skeleton width="w-64" height="h-8" className="mb-4" />
        <Skeleton width="w-96" height="h-5" />
      </div>

      {/* Search bar skeleton */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <Skeleton width="w-32" height="h-5" className="mb-3" />
        <div className="flex gap-3">
          <Skeleton height="h-10" className="flex-1" />
          <Skeleton width="w-24" height="h-10" />
        </div>
        <Skeleton width="w-40" height="h-4" className="mt-3" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-7 gap-4">
            <Skeleton height="h-5" />
            <Skeleton height="h-5" />
            <Skeleton height="h-5" />
            <Skeleton height="h-5" />
            <Skeleton height="h-5" />
            <Skeleton height="h-5" />
            <Skeleton height="h-5" />
          </div>
        </div>
        
        {/* Table rows */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="px-6 py-4">
              <div className="grid grid-cols-7 gap-4 items-center">
                <Skeleton height="h-4" width="w-3/4" />
                <Skeleton height="h-4" width="w-3/4" />
                <Skeleton height="h-4" width="w-2/3" />
                <Skeleton height="h-4" width="w-1/2" />
                <div className="space-y-1">
                  <Skeleton height="h-3" width="w-full" />
                  <Skeleton height="h-3" width="w-4/5" />
                  <Skeleton height="h-3" width="w-3/5" />
                </div>
                <Skeleton height="h-4" width="w-8" />
                <Skeleton height="h-4" width="w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading indicator with text */}
      <div className="flex items-center justify-center mt-8 space-x-3">
        <LoadingSpinner size="md" />
        <div className="text-gray-600">
          <p className="font-medium">Loading advocates...</p>
          <p className="text-sm text-gray-500">Please wait while we fetch the latest data</p>
        </div>
      </div>
    </div>
  );
}