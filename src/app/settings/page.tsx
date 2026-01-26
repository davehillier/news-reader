'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, X, Loader2, Newspaper, Sparkles, Eye, Bookmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { FEED_SOURCES } from '@/lib/feedSources';
import { CATEGORIES } from '@/types';

export default function SettingsPage() {
  const { user, loading: authLoading, signIn, logOut } = useAuth();
  const { preferences, loading: prefsLoading, toggleSource, setAiSummariesEnabled } = usePreferences();
  const [mutedInput, setMutedInput] = useState('');

  const loading = authLoading || prefsLoading;

  // Group sources by category
  const sourcesByCategory = CATEGORIES.filter(c => c.id !== 'all').map(category => ({
    ...category,
    sources: FEED_SOURCES.filter(s => s.category === category.id),
  }));

  const isSourceEnabled = (sourceId: string) => {
    if (!preferences || preferences.enabledSources.length === 0) return true;
    return preferences.enabledSources.includes(sourceId);
  };

  return (
    <div className="min-h-screen bg-[var(--color-parchment)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--color-parchment)]/95 backdrop-blur-md
                        border-b border-[var(--color-pearl)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 sm:h-20">
            <Link
              href="/"
              className="flex items-center gap-2 text-[var(--color-steel)] hover:text-[var(--color-ink)]
                       transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to feed</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page title */}
        <div className="mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--color-ink)]
                       tracking-tight">
            Settings
          </h1>
          <p className="mt-2 text-[var(--color-steel)]">
            Customise your Morning Briefing experience
          </p>
        </div>

        {/* Account section */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-0.5 bg-[var(--color-bronze)]" />
            <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">
              Account
            </h2>
          </div>

          <div className="bg-[var(--color-paper)] rounded-sm shadow-[var(--shadow-card)] p-6">
            {authLoading ? (
              <div className="flex items-center gap-3 text-[var(--color-steel)]">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-12 h-12 rounded-full border-2 border-[var(--color-bronze-muted)]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[var(--color-bronze-muted)]
                                  flex items-center justify-center">
                      <span className="text-lg font-semibold text-[var(--color-bronze-dark)]">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-sm text-[var(--color-steel)]">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={logOut}
                  className="px-4 py-2 rounded-full text-sm font-medium
                           text-[var(--color-steel)] hover:text-[var(--color-ink)]
                           border border-[var(--color-pearl)] hover:border-[var(--color-silver)]
                           transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-[var(--color-steel)] mb-4">
                  Sign in to save your preferences across devices
                </p>
                <button
                  onClick={signIn}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                           bg-[var(--color-bronze)] text-white font-medium
                           hover:bg-[var(--color-bronze-dark)] transition-colors"
                >
                  Sign in with Google
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Sources section */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-0.5 bg-[var(--color-bronze)]" />
            <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">
              News Sources
            </h2>
          </div>

          <div className="bg-[var(--color-paper)] rounded-sm shadow-[var(--shadow-card)] overflow-hidden">
            {!user && (
              <div className="px-6 py-4 bg-[var(--color-parchment)] border-b border-[var(--color-pearl)]">
                <p className="text-sm text-[var(--color-steel)]">
                  Sign in to customise your news sources
                </p>
              </div>
            )}

            {sourcesByCategory.map((category, categoryIndex) => (
              <div
                key={category.id}
                className={categoryIndex > 0 ? 'border-t border-[var(--color-pearl)]' : ''}
              >
                <div className="px-6 py-3 bg-[var(--color-parchment)]/50">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-bronze)]">
                    {category.label}
                  </h3>
                </div>
                <div className="divide-y divide-[var(--color-pearl)]">
                  {category.sources.map(source => {
                    const enabled = isSourceEnabled(source.id);
                    return (
                      <div
                        key={source.id}
                        className="flex items-center justify-between px-6 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <Newspaper className="w-4 h-4 text-[var(--color-silver)]" />
                          <span className={`text-sm ${enabled ? 'text-[var(--color-ink)]' : 'text-[var(--color-silver)]'}`}>
                            {source.name}
                          </span>
                        </div>
                        <button
                          onClick={() => user && toggleSource(source.id)}
                          disabled={!user || loading}
                          className={`w-10 h-6 rounded-full transition-colors relative
                                    ${enabled ? 'bg-[var(--color-bronze)]' : 'bg-[var(--color-pearl)]'}
                                    ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm
                                      transition-transform ${enabled ? 'left-5' : 'left-1'}`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Features section */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-0.5 bg-[var(--color-bronze)]" />
            <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">
              AI Features
            </h2>
          </div>

          <div className="bg-[var(--color-paper)] rounded-sm shadow-[var(--shadow-card)] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[var(--color-bronze)]" />
                <div>
                  <p className="font-medium text-[var(--color-ink)]">AI Summaries</p>
                  <p className="text-sm text-[var(--color-steel)]">
                    Generate quick summaries of articles
                  </p>
                </div>
              </div>
              <button
                onClick={() => user && setAiSummariesEnabled(!preferences?.aiSummariesEnabled)}
                disabled={!user || loading}
                className={`w-10 h-6 rounded-full transition-colors relative
                          ${preferences?.aiSummariesEnabled ? 'bg-[var(--color-bronze)]' : 'bg-[var(--color-pearl)]'}
                          ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm
                            transition-transform ${preferences?.aiSummariesEnabled ? 'left-5' : 'left-1'}`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Reading stats */}
        {user && preferences && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-0.5 bg-[var(--color-bronze)]" />
              <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">
                Reading Stats
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--color-paper)] rounded-sm shadow-[var(--shadow-card)] p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-[var(--color-bronze)]" />
                </div>
                <p className="text-3xl font-display font-semibold text-[var(--color-ink)]">
                  {preferences.readArticles.length}
                </p>
                <p className="text-sm text-[var(--color-steel)]">Articles read</p>
              </div>

              <div className="bg-[var(--color-paper)] rounded-sm shadow-[var(--shadow-card)] p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Bookmark className="w-5 h-5 text-[var(--color-bronze)]" />
                </div>
                <p className="text-3xl font-display font-semibold text-[var(--color-ink)]">
                  {preferences.savedArticles.length}
                </p>
                <p className="text-sm text-[var(--color-steel)]">Articles saved</p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
