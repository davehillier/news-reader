'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { CategoryNav } from '@/components/feed/CategoryNav';
import { FeedGrid } from '@/components/feed/FeedGrid';
import { SkeletonFeed } from '@/components/feed/SkeletonCard';
import { AIEmailDigest } from '@/components/ai/AIEmailDigest';
import { AIChat } from '@/components/ai/AIChat';
import {
  BriefingMasthead,
  BriefingTopStories,
  BriefingTalkingPoints,
  BriefingPeople,
  SectionDivider,
} from '@/components/briefing';
import { useFeed } from '@/hooks/useFeed';
import { useBriefingData } from '@/hooks/useBriefingData';
import { useAuth } from '@/context/AuthContext';
import type { Category } from '@/types';
import { AlertCircle, RefreshCw, Newspaper } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const {
    articles,
    isLoading: feedLoading,
    isRefreshing,
    error: feedError,
    lastUpdated,
    sourceStatuses,
    refresh: refreshFeed,
  } = useFeed({ category: activeCategory });

  const {
    briefing,
    talkingPoints,
    people,
    briefingLoading,
    talkingPointsLoading,
    peopleLoading,
    canRefresh,
    refreshBriefing,
    refreshTalkingPoints,
    refreshPeople,
  } = useBriefingData(articles);

  const healthySources = sourceStatuses.filter((s) => s.status === 'ok').length;
  const totalSources = sourceStatuses.length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header
        lastUpdated={lastUpdated ?? undefined}
        isRefreshing={isRefreshing}
        onRefresh={refreshFeed}
      />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* === BRIEFING SECTION (above the fold) === */}
          {user && !feedLoading && !feedError && articles.length > 0 && (
            <>
              {/* Masthead */}
              <BriefingMasthead
                greeting={briefing?.greeting || null}
                isLoading={briefingLoading}
                canRefresh={canRefresh}
                onRefresh={() => refreshBriefing()}
              />

              {/* Top Stories */}
              <BriefingTopStories
                briefing={briefing}
                isLoading={briefingLoading}
              />

              <SectionDivider />

              {/* Talking Points */}
              <BriefingTalkingPoints
                talkingPoints={talkingPoints}
                isLoading={talkingPointsLoading}
                canRefresh={canRefresh}
                onRefresh={() => refreshTalkingPoints()}
              />

              <SectionDivider />

              {/* People in the News */}
              <BriefingPeople
                people={people}
                isLoading={peopleLoading}
                canRefresh={canRefresh}
                onRefresh={() => refreshPeople()}
              />

              <SectionDivider />
            </>
          )}

          {/* === LATEST STORIES (below the fold) === */}
          <section className="py-6 sm:py-8">
            <div className="flex items-center gap-2 mb-6">
              <Newspaper className="w-4 h-4 text-[var(--color-bronze)]" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-bronze)]">
                Latest Stories
              </h2>
            </div>

            {/* Category navigation */}
            <div className="mb-6 sm:mb-8">
              <CategoryNav
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>

            {/* Feed error state */}
            {feedError && !feedLoading && (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-error)]/10
                              flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-[var(--color-error)]" />
                </div>
                <h3 className="font-display text-xl font-semibold text-[var(--color-ink)] mb-2">
                  Failed to load news
                </h3>
                <p className="text-[var(--color-steel)] max-w-md mb-6">
                  {feedError.message || 'Something went wrong while fetching the latest news.'}
                </p>
                <button
                  onClick={refreshFeed}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full
                           bg-[var(--color-bronze)] text-white font-medium
                           hover:bg-[var(--color-bronze-dark)] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try again
                </button>
              </div>
            )}

            {/* Feed loading state */}
            {feedLoading && !feedError && <SkeletonFeed />}

            {/* Feed grid */}
            {!feedLoading && !feedError && <FeedGrid articles={articles} />}
          </section>

          {/* Utility FABs (Email + Chat) */}
          {!feedLoading && !feedError && articles.length > 0 && user && (
            <>
              <AIEmailDigest articles={articles} />
              <AIChat articles={articles} />
            </>
          )}

          {/* Source health indicator */}
          {!feedLoading && sourceStatuses.length > 0 && (
            <footer className="mt-12 pt-6 border-t border-[var(--color-pearl)] pb-8">
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
