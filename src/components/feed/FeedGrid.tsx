'use client';

import type { Article } from '@/types';
import { HeroCard } from './HeroCard';
import { StoryCard } from './StoryCard';
import { CompactCardList } from './CompactCard';

interface FeedGridProps {
  articles: Article[];
}

export function FeedGrid({ articles }: FeedGridProps) {
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--color-bronze-muted)]
                      flex items-center justify-center mb-6">
          <span className="font-display text-3xl text-[var(--color-bronze)]">?</span>
        </div>
        <h3 className="font-display text-xl font-semibold text-[var(--color-ink)] mb-2">
          No stories found
        </h3>
        <p className="text-[var(--color-steel)] max-w-md">
          We couldn&apos;t find any articles matching your criteria.
          Try selecting a different category or check back later.
        </p>
      </div>
    );
  }

  // Split articles into sections
  const heroArticle = articles[0];
  const storyArticles = articles.slice(1, 10); // Next 9 articles for 3x3 grid
  const compactArticles = articles.slice(10, 20); // Remaining for compact list

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section aria-label="Featured story">
        <HeroCard article={heroArticle} />
      </section>

      {/* Story Grid Section */}
      {storyArticles.length > 0 && (
        <section aria-label="More stories">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              More Stories
            </h2>
            <div className="flex-1 h-px bg-[var(--color-pearl)]" />
          </div>

          {/* Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {storyArticles.map((article, index) => (
              <div
                key={article.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <StoryCard article={article} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Compact List Section */}
      {compactArticles.length > 0 && (
        <section aria-label="Quick reads">
          <CompactCardList articles={compactArticles} title="Quick Reads" />
        </section>
      )}
    </div>
  );
}
