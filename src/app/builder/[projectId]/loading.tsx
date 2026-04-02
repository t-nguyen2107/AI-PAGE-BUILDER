export default function BuilderLoading() {
  return (
    <div className="flex h-screen bg-surface-lowest">
      {/* Left sidebar skeleton */}
      <div className="w-64 bg-surface-container-low border-r border-outline-variant/20 p-4 animate-pulse">
        <div className="h-6 bg-surface-container rounded-lg w-3/4 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-surface-container rounded-lg" />
          ))}
        </div>
      </div>

      {/* Main canvas skeleton */}
      <div className="flex-1 p-12 animate-pulse">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="h-10 bg-surface-container rounded-lg w-1/2" />
          <div className="h-64 bg-surface-container rounded-2xl" />
          <div className="h-6 bg-surface-container rounded-lg w-3/4" />
          <div className="h-6 bg-surface-container rounded-lg w-1/2" />
        </div>
      </div>

      {/* Right panel skeleton */}
      <div className="w-80 bg-surface-lowest border-l border-outline-variant/20 p-4 animate-pulse">
        <div className="h-8 bg-surface-container rounded-lg w-1/2 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-surface-container rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
