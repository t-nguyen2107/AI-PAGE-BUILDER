import { Skeleton } from '@/components/ui/skeleton';

export default function BuilderLoading() {
  return (
    <div className="flex h-screen bg-surface-lowest">
      {/* Left sidebar skeleton */}
      <div className="w-64 bg-surface-container-low border-r border-outline-variant/20 p-4">
        <Skeleton className="h-6 w-3/4 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </div>

      {/* Main canvas skeleton */}
      <div className="flex-1 p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </div>

      {/* Right panel skeleton */}
      <div className="w-80 bg-surface-lowest border-l border-outline-variant/20 p-4">
        <Skeleton className="h-8 w-1/2 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    </div>
  );
}
