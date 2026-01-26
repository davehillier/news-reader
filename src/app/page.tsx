'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { CategoryNav } from '@/components/feed/CategoryNav';
import { FeedGrid } from '@/components/feed/FeedGrid';
import { SkeletonFeed } from '@/components/feed/SkeletonCard';
import { AIBriefing } from '@/components/ai/AIBriefing';
import { AIChat } from '@/components/ai/AIChat';
import { AITalkingPoints } from '@/components/ai/AITalkingPoints';
import { AIWeeklyBios } from '@/components/ai/AIWeeklyBios';
import { useFeed } from '@/hooks/useFeed';
import type { Category } from '@/types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const {
    articles,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    sourceStatuses,
    refresh,
  } = useFeed({ category: activeCategory });

  // Show source health summary
  const healthySources = sourceStatuses.filter((s) => s.status === 'ok').length;
  const totalSources = sourceStatuses.length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header
        lastUpdated={lastUpdated ?? undefined}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Category navigation */}
          <div className="mb-6 sm:mb-8">
            <CategoryNav
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Error state */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-error)]/10
                            flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-[var(--color-error)]" />
              </div>
              <h3 className="font-display text-xl font-semibold text-[var(--color-ink)] mb-2">
                Failed to load news
              </h3>
              <p className="text-[var(--color-steel)] max-w-md mb-6">
                {error.message || 'Something went wrong while fetching the latest news.'}
              </p>
              <button
                onClick={refresh}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full
                         bg-[var(--color-bronze)] text-white font-medium
                         hover:bg-[var(--color-bronze-dark)] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
            </div>
          )}

          {/* Loading state */}
          {isLoading && !error && <SkeletonFeed />}

          {/* Content */}
          {!isLoading && !error && <FeedGrid articles={articles} />}

          {/* AI Features - only visible for allowed users */}
          {!isLoading && !error && articles.length > 0 && (
            <>
              <AIBriefing articles={articles} />
              <AITalkingPoints articles={articles} />
              <AIWeeklyBios articles={articles} />
              <AIChat articles={articles} />
            </>
          )}

          {/* Source health indicator (footer) */}
          {!isLoading && sourceStatuses.length > 0 && (
            <footer className="mt-12 pt-6 border-t border-[var(--color-pearl)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center
                            justify-between gap-4 text-sm text-[var(--color-silver)]">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      healthySources === totalSources
                        ? 'bg-[var(--color-success)]'
                        : healthySources > 0
                        ? 'bg-[var(--color-warning)]'
                        : 'bg-[var(--color-error)]'
                    }`}
                  />
                  <span>
                    {healthySources}/{totalSources} sources connected
                  </span>
                </div>

                <p className="text-xs text-[var(--color-silver)]">
                  News aggregated from BBC, Guardian, TechCrunch, Reuters, Sky Sports and more
                </p>
              </div>
            </footer>
          )}
        </div>
      </main>
    </div>
  );
}
