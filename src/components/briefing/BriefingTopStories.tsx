import { TrendingUp } from 'lucide-react';
import type { MorningBriefing } from '@/lib/aiTypes';
import { TopStoriesSkeleton } from './BriefingSkeleton';

interface BriefingTopStoriesProps {
  briefing: MorningBriefing | null;
  isLoading: boolean;
}

const categoryColors: Record<string, string> = {
  tech: 'bg-blue-100 text-blue-700',
  finance: 'bg-green-100 text-green-700',
  uk: 'bg-red-100 text-red-700',
  world: 'bg-purple-100 text-purple-700',
  sport: 'bg-orange-100 text-orange-700',
  culture: 'bg-pink-100 text-pink-700',
  science: 'bg-teal-100 text-teal-700',
};

export function BriefingTopStories({ briefing, isLoading }: BriefingTopStoriesProps) {
  if (isLoading) return <TopStoriesSkeleton />;
  if (!briefing || briefing.topStories.length === 0) return null;

  const heroStory = briefing.topStories[0];
  const sideStories = briefing.topStories.slice(1, 4);
  const remainingStories = briefing.topStories.slice(4);

  return (
    <section>
      {/* Section header */}
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em]
                     text-[var(--color-bronze)] mb-6">
        <TrendingUp className="w-4 h-4" />
        Top Stories
      </h2>

      {/* Hero + sidebar layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Hero story */}
        <div className="lg:col-span-2 rounded-lg bg-[var(--color-paper)] border border-[var(--color-pearl)]
                       shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]
                       transition-shadow duration-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--color-bronze)]
                             flex items-center justify-center text-sm font-bold text-white shadow-md">
                1
              </span>
              <span className={`px-2.5 py-1 rounded text-xs font-semibold
                             ${categoryColors[heroStory.category] || 'bg-gray-100 text-gray-700'}`}>
                {heroStory.category.toUpperCase()}
              </span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]
                          leading-tight mb-4">
              {heroStory.headline}
            </h3>
            <p className="text-[var(--color-steel)] leading-relaxed text-base sm:text-lg">
              {heroStory.insight}
            </p>
          </div>
        </div>

        {/* Side stories */}
        <div className="space-y-4">
          {sideStories.map((story, i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-[var(--color-paper)] border border-[var(--color-pearl)]
                        shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]
                        transition-shadow duration-200"
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-bronze-muted)]
                               flex items-center justify-center text-xs font-bold text-[var(--color-bronze-dark)]">
                  {i + 2}
                </span>
                <div className="flex-1 min-w-0">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mb-1.5
                                  ${categoryColors[story.category] || 'bg-gray-100 text-gray-700'}`}>
                    {story.category.toUpperCase()}
                  </span>
                  <h4 className="font-medium text-[var(--color-ink)] text-sm leading-snug mb-1">
                    {story.headline}
                  </h4>
                  <p className="text-xs text-[var(--color-steel)] line-clamp-2">
                    {story.insight}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Remaining stories as compact list */}
      {remainingStories.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {remainingStories.map((story, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-parchment)]
                        border border-[var(--color-pearl)]"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-pearl)]
                             flex items-center justify-center text-[10px] font-bold text-[var(--color-steel)]">
                {i + 5}
              </span>
              <div className="flex-1 min-w-0">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold mb-1
                                ${categoryColors[story.category] || 'bg-gray-100 text-gray-700'}`}>
                  {story.category.toUpperCase()}
                </span>
                <p className="text-sm text-[var(--color-ink)] font-medium leading-snug">
                  {story.headline}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Themes */}
      {briefing.themes.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[var(--color-pearl)]">
          <span className="text-xs uppercase tracking-wider text-[var(--color-steel)] mr-3">
            Themes
          </span>
          <div className="inline-flex flex-wrap gap-2 mt-1">
            {briefing.themes.map((theme, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full text-xs font-medium
                         bg-[var(--color-bronze-muted)] text-[var(--color-bronze-dark)]"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
