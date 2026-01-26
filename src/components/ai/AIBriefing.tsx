'use client';

import { useState } from 'react';
import { Sparkles, Loader2, MessageCircle, TrendingUp, Coffee, X, RefreshCw, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Article } from '@/types';
import type { MorningBriefing, AIProvider } from '@/lib/aiTypes';

interface AIBriefingProps {
  articles: Article[];
}

const categoryColors: Record<string, string> = {
  tech: 'bg-blue-100 text-blue-700',
  finance: 'bg-green-100 text-green-700',
  uk: 'bg-red-100 text-red-700',
  world: 'bg-purple-100 text-purple-700',
  sport: 'bg-orange-100 text-orange-700',
};

export function AIBriefing({ articles }: AIBriefingProps) {
  const { user, getToken } = useAuth();
  const [briefing, setBriefing] = useState<MorningBriefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [usedProvider, setUsedProvider] = useState<AIProvider | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [isCached, setIsCached] = useState(false);

  // Only show for authenticated users; server determines if AI access is allowed
  if (!user || isHidden) return null;

  const generateBriefing = async (selectedProvider: AIProvider = provider, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setIsOpen(true);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articles: articles.map(a => ({
            title: a.title,
            description: a.description,
            category: a.category,
            source: a.source.name,
          })),
          provider: selectedProvider,
          forceRefresh,
        }),
      });

      if (response.status === 403) {
        // User not authorised for AI features - hide the button
        setIsHidden(true);
        setIsOpen(false);
        return;
      }

      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }

      if (!response.ok) {
        throw new Error('Failed to generate briefing');
      }

      const data = await response.json();
      setBriefing(data);
      setUsedProvider(data.provider || selectedProvider);
      setIsCached(data.cached || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating action button */}
      <button
        onClick={() => generateBriefing()}
        disabled={loading}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full
                 bg-gradient-to-r from-[var(--color-bronze)] to-[var(--color-bronze-dark)]
                 text-white font-medium shadow-lg
                 hover:from-[var(--color-bronze-dark)] hover:to-[var(--color-ink)]
                 hover:shadow-xl hover:scale-105
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                 transition-all duration-200"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Coffee className="w-5 h-5" />
        )}
        <span className="hidden sm:inline">Morning Briefing</span>
      </button>

      {/* Briefing modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed inset-4 sm:inset-8 lg:inset-y-8 lg:left-1/4 lg:right-8 overflow-y-auto
                      rounded-lg bg-[var(--color-paper)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[var(--color-parchment)]
                       text-[var(--color-steel)] hover:text-[var(--color-ink)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 lg:p-10">
              {/* Header with provider toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-bronze)] to-[var(--color-bronze-dark)]
                                flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
                      Your Briefing
                    </h2>
                    <p className="text-sm text-[var(--color-steel)]">
                      Powered by {usedProvider === 'gemini' ? 'Google Gemini' : 'Claude AI'}
                    </p>
                  </div>
                </div>

                {/* Provider toggle */}
                <div className="flex items-center gap-2 bg-[var(--color-parchment)] p-1 rounded-full">
                  <button
                    onClick={() => {
                      setProvider('claude');
                      if (briefing) generateBriefing('claude');
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                              ${provider === 'claude'
                                ? 'bg-[var(--color-bronze)] text-white'
                                : 'text-[var(--color-steel)] hover:text-[var(--color-ink)]'
                              }`}
                  >
                    Claude
                  </button>
                  <button
                    onClick={() => {
                      setProvider('gemini');
                      if (briefing) generateBriefing('gemini');
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                              ${provider === 'gemini'
                                ? 'bg-[var(--color-bronze)] text-white'
                                : 'text-[var(--color-steel)] hover:text-[var(--color-ink)]'
                              }`}
                  >
                    Gemini
                  </button>
                </div>
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 text-[var(--color-bronze)] animate-spin mb-4" />
                  <p className="text-[var(--color-steel)]">Preparing your briefing...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-16">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => generateBriefing()}
                    className="px-4 py-2 rounded-full bg-[var(--color-bronze)] text-white"
                  >
                    Try again
                  </button>
                </div>
              )}

              {briefing && !loading && (
                <div className="space-y-8">
                  {/* Greeting */}
                  <p className="text-xl text-[var(--color-ink)] font-medium leading-relaxed">
                    {briefing.greeting}
                  </p>

                  {/* Top Stories */}
                  <section>
                    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider
                                 text-[var(--color-bronze)] mb-4">
                      <TrendingUp className="w-4 h-4" />
                      Top Stories
                    </h3>
                    <div className="space-y-4">
                      {briefing.topStories.map((story, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-lg bg-[var(--color-parchment)] border border-[var(--color-pearl)]"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-bronze-muted)]
                                          flex items-center justify-center text-sm font-bold text-[var(--color-bronze-dark)]">
                              {i + 1}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium
                                              ${categoryColors[story.category] || 'bg-gray-100 text-gray-700'}`}>
                                  {story.category.toUpperCase()}
                                </span>
                              </div>
                              <h4 className="font-medium text-[var(--color-ink)] mb-1">
                                {story.headline}
                              </h4>
                              <p className="text-sm text-[var(--color-steel)]">
                                {story.insight}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Themes */}
                  <section>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-bronze)] mb-3">
                      Today's Themes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {briefing.themes.map((theme, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-full text-sm font-medium
                                   bg-[var(--color-bronze-muted)] text-[var(--color-bronze-dark)]"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </section>

                  {/* Conversation Starters */}
                  <section>
                    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider
                                 text-[var(--color-bronze)] mb-3">
                      <MessageCircle className="w-4 h-4" />
                      Coffee Machine Talking Points
                    </h3>
                    <ul className="space-y-3">
                      {briefing.conversationStarters.map((starter, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-[var(--color-steel)]"
                        >
                          <span className="text-[var(--color-bronze)]">"</span>
                          <span className="italic">{starter}</span>
                          <span className="text-[var(--color-bronze)]">"</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Footer */}
                  <div className="pt-4 border-t border-[var(--color-pearl)] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[var(--color-silver)]">
                      {isCached && (
                        <div className="flex items-center gap-1 text-[var(--color-bronze)]">
                          <Clock className="w-3 h-3" />
                          <span>Cached</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => generateBriefing(provider, true)}
                      disabled={loading}
                      className="flex items-center gap-1 text-sm text-[var(--color-bronze)] hover:text-[var(--color-bronze-dark)]
                               font-medium transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
