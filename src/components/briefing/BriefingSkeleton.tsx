export function TopStoriesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-5 skeleton rounded w-32" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Hero skeleton */}
        <div className="lg:col-span-2 rounded-lg overflow-hidden border border-[var(--color-pearl)]">
          <div className="h-48 sm:h-64 skeleton" />
          <div className="p-5 space-y-3">
            <div className="h-4 skeleton rounded w-20" />
            <div className="h-6 skeleton rounded w-full" />
            <div className="h-4 skeleton rounded w-5/6" />
          </div>
        </div>
        {/* Side stories skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-lg border border-[var(--color-pearl)]">
              <div className="h-3 skeleton rounded w-16 mb-2" />
              <div className="h-5 skeleton rounded w-full mb-2" />
              <div className="h-3 skeleton rounded w-4/5" />
            </div>
          ))}
        </div>
      </div>
      {/* Theme tags skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-8 skeleton rounded-full w-24" />
        ))}
      </div>
    </div>
  );
}

export function TalkingPointsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-5 skeleton rounded w-40" />
      {/* Hero talking point */}
      <div className="p-6 rounded-lg border border-[var(--color-pearl)]">
        <div className="h-4 skeleton rounded w-28 mb-3" />
        <div className="h-6 skeleton rounded w-3/4 mb-3" />
        <div className="h-4 skeleton rounded w-full mb-2" />
        <div className="h-4 skeleton rounded w-5/6" />
      </div>
      {/* Trends grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map(i => (
          <div key={i} className="p-4 rounded-lg border border-[var(--color-pearl)]">
            <div className="h-5 skeleton rounded w-3/4 mb-2" />
            <div className="h-3 skeleton rounded w-full mb-2" />
            <div className="h-3 skeleton rounded w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PeopleSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-5 skeleton rounded w-44" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="rounded-xl border-2 border-[var(--color-pearl)] overflow-hidden">
            <div className="aspect-[3/4] skeleton" />
            <div className="p-4 space-y-2">
              <div className="h-5 skeleton rounded w-3/4" />
              <div className="h-3 skeleton rounded w-1/2" />
              <div className="h-3 skeleton rounded w-full" />
              <div className="h-3 skeleton rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
