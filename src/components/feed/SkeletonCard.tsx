'use client';

interface SkeletonCardProps {
  variant?: 'hero' | 'story' | 'compact';
}

export function SkeletonCard({ variant = 'story' }: SkeletonCardProps) {
  if (variant === 'hero') {
    return (
      <div className="rounded-sm bg-[var(--color-paper)] shadow-[var(--shadow-card)] overflow-hidden
                    animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] min-h-[320px] lg:min-h-[420px]">
          {/* Image placeholder */}
          <div className="skeleton aspect-[16/9] lg:aspect-auto" />

          {/* Content */}
          <div className="p-6 lg:p-8 xl:p-10 flex flex-col justify-between">
            {/* Badge and time */}
            <div className="flex items-center gap-3 mb-4">
              <div className="skeleton h-6 w-24 rounded-full" />
              <div className="skeleton h-4 w-16 rounded" />
            </div>

            {/* Headline */}
            <div className="flex-1 space-y-3">
              <div className="skeleton h-8 w-full rounded" />
              <div className="skeleton h-8 w-4/5 rounded" />
              <div className="skeleton h-8 w-2/3 rounded" />

              {/* Description */}
              <div className="pt-4 space-y-2">
                <div className="skeleton h-5 w-full rounded" />
                <div className="skeleton h-5 w-11/12 rounded" />
                <div className="skeleton h-5 w-3/4 rounded" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-pearl)]">
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-4 w-24 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-4 py-4 px-1 animate-pulse">
        {/* Index circle */}
        <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-3 w-12 rounded" />
          </div>
          <div className="skeleton h-5 w-full rounded" />
          <div className="skeleton h-5 w-3/4 rounded" />
        </div>
      </div>
    );
  }

  // Default: story variant
  return (
    <div className="rounded-sm bg-[var(--color-paper)] shadow-[var(--shadow-card)] overflow-hidden
                  animate-pulse">
      {/* Image placeholder */}
      <div className="skeleton aspect-[16/10]" />

      {/* Content */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* Time */}
        <div className="skeleton h-4 w-16 rounded" />

        {/* Headline */}
        <div className="space-y-2">
          <div className="skeleton h-6 w-full rounded" />
          <div className="skeleton h-6 w-4/5 rounded" />
        </div>

        {/* Description */}
        <div className="space-y-2 pt-1">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[var(--color-pearl)]">
          <div className="skeleton h-4 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonFeed() {
  return (
    <div className="space-y-8">
      {/* Hero skeleton */}
      <SkeletonCard variant="hero" />

      {/* Story grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} variant="story" />
        ))}
      </div>

      {/* Compact list skeleton */}
      <div className="bg-[var(--color-paper)] rounded-sm shadow-[var(--shadow-card)] p-4">
        <div className="skeleton h-6 w-32 rounded mb-4" />
        {[...Array(5)].map((_, i) => (
          <SkeletonCard key={i} variant="compact" />
        ))}
      </div>
    </div>
  );
}
