export function LoadingSpinner({
  size = "md",
  text,
}: {
  size?: "sm" | "md" | "lg";
  text?: string;
}) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`${sizes[size]} border-gray-200 border-t-red-600 rounded-full animate-spin`}
      />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}

export function LoadingPage({ text = "Loading..." }: { text?: string } = {}) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function ButtonSpinner() {
  return (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
  );
}

// Skeleton Loaders
export function SkeletonText({ className = "" }: { className?: string }) {
  return (
    <div className={`h-4 bg-gray-200 rounded animate-pulse ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-6 py-4 border-b border-gray-200 last:border-b-0"
        >
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow p-6 space-y-3 animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonMap() {
  return (
    <div className="w-full h-[500px] bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-400 text-center">
        <div className="text-4xl mb-2">🗺️</div>
        <p>Loading map...</p>
      </div>
    </div>
  );
}
