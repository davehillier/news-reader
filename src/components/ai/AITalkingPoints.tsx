'use client';

import { useState } from 'react';
import {
  MessageCircle,
  Loader2,
  X,
  Lightbulb,
  TrendingUp,
  Zap,
  Smile,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Article } from '@/types';
import type { TalkingPoints, AIProvider } from '@/lib/aiTypes';

interface AITalkingPointsProps {
  articles: Article[];
}

const categoryIcons: Record<string, string> = {
  tech: '💻',
  finance: '📈',
  uk: '🇬🇧',
  world: '🌍',
  sport: '⚽',
};

export function AITalkingPoints({ articles }: AITalkingPointsProps) {
  const { user, getToken } = useAuth();
  const [talkingPoints, setTalkingPoints] = useState<TalkingPoints | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [usedProvider, setUsedProvider] = useState<AIProvider | null>(null);

  // Only show for allowed users
  const allowedEmails = ['hillier.dave@gmail.com', 'dave@davehillier.com'];
  const isAllowed = user?.email && allowedEmails.includes(user.email.toLowerCase());

  if (!isAllowed) return null;

  const generateTalkingPoints = async (selectedProvider: AIProvider = provider) => {
    setLoading(true);
    setError(null);
    setIsOpen(true);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/ai/talking-points', {
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
            publishedAt: a.publishedAt,
          })),
          provider: selectedProvider,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate talking points');
      }

      const data = await response.json();
      setTalkingPoints(data);
      setUsedProvider(data.provider || selectedProvider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Prominent talking points button - positioned between briefing and chat */}
      <button
        onClick={() => generateTalkingPoints()}
        disabled={loading}
        className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full
                 bg-[var(--color-ink)] text-white font-medium shadow-lg
                 hover:bg-[var(--color-bronze-dark)] hover:shadow-xl hover:scale-105
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                 transition-all duration-200"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}
        <span className="hidden sm:inline">Talking Points</span>
      </button>

      {/* Talking points modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed inset-4 sm:inset-6 lg:inset-8 overflow-y-auto
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

            <div className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-ink)]
                                flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-6 h-6 text-[var(--color-bronze)]" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
                      Conversation Talking Points
                    </h2>
                    <p className="text-sm text-[var(--color-steel)]">
                      Be the most interesting person at the water cooler
                    </p>
                  </div>
                </div>

                {/* Provider toggle */}
                <div className="flex items-center gap-2 bg-[var(--color-parchment)] p-1 rounded-full">
                  <button
                    onClick={() => {
                      setProvider('claude');
                      if (talkingPoints) generateTalkingPoints('claude');
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
                      if (talkingPoints) generateTalkingPoints('gemini');
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
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-[var(--color-bronze)] animate-spin mb-4" />
                  <p className="text-[var(--color-steel)]">
                    Crafting your conversation arsenal...
                  </p>
                </div>
              )}

              {error && (
                <div className="text-center py-16">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => generateTalkingPoints()}
                    className="px-4 py-2 rounded-full bg-[var(--color-bronze)] text-white"
                  >
                    Try again
                  </button>
                </div>
              )}

              {talkingPoints && !loading && (
                <div className="space-y-8">
                  {/* Today's Highlight - Hero section */}
                  <section className="bg-gradient-to-br from-[var(--color-bronze-muted)]/40 to-[var(--color-parchment)]
                                    rounded-lg p-6 border border-[var(--color-bronze-muted)]">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="w-5 h-5 text-[var(--color-bronze)]" />
                      <h3 className="font-semibold text-[var(--color-bronze-dark)]">
                        Lead With This
                      </h3>
                    </div>
                    <h4 className="font-display text-xl font-semibold text-[var(--color-ink)] mb-3">
                      {talkingPoints.todayHighlight.topic}
                    </h4>
                    <p className="text-[var(--color-steel)] mb-4 italic">
                      "{talkingPoints.todayHighlight.opener}"
                    </p>
                    <p className="text-[var(--color-ink)] leading-relaxed mb-4">
                      {talkingPoints.todayHighlight.insight}
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-white/50 rounded-lg">
                      <ChevronRight className="w-4 h-4 text-[var(--color-bronze)] mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-[var(--color-steel)]">
                        <span className="font-medium">Follow up with:</span> {talkingPoints.todayHighlight.followUp}
                      </p>
                    </div>
                  </section>

                  {/* Weekly Trends */}
                  {talkingPoints.weeklyTrends.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-[var(--color-bronze)]" />
                        <h3 className="font-semibold text-[var(--color-ink)]">
                          This Week's Patterns
                        </h3>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {talkingPoints.weeklyTrends.map((trend, i) => (
                          <div
                            key={i}
                            className="p-4 rounded-lg bg-[var(--color-parchment)] border border-[var(--color-pearl)]"
                          >
                            <h4 className="font-medium text-[var(--color-ink)] mb-2">
                              {trend.theme}
                            </h4>
                            <p className="text-sm text-[var(--color-steel)] mb-3">
                              {trend.summary}
                            </p>
                            <p className="text-sm text-[var(--color-bronze-dark)] italic">
                              "{trend.talkingPoint}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Two-column: Controversial + Light */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* Controversial Take */}
                    {talkingPoints.controversialTake.topic && (
                      <section className="p-5 rounded-lg bg-[var(--color-parchment)] border-l-4 border-[var(--color-bronze)]">
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="w-4 h-4 text-[var(--color-bronze)]" />
                          <h3 className="font-semibold text-[var(--color-ink)] text-sm">
                            Bold Take
                          </h3>
                        </div>
                        <p className="font-medium text-[var(--color-ink)] mb-2">
                          {talkingPoints.controversialTake.topic}
                        </p>
                        <p className="text-sm text-[var(--color-steel)] mb-2 italic">
                          "{talkingPoints.controversialTake.contrarian}"
                        </p>
                        <p className="text-xs text-[var(--color-silver)]">
                          ⚖️ {talkingPoints.controversialTake.caveat}
                        </p>
                      </section>
                    )}

                    {/* Light Moment */}
                    {talkingPoints.lightMoment.topic && (
                      <section className="p-5 rounded-lg bg-[var(--color-bronze-muted)]/20 border border-[var(--color-bronze-muted)]">
                        <div className="flex items-center gap-2 mb-3">
                          <Smile className="w-4 h-4 text-[var(--color-bronze)]" />
                          <h3 className="font-semibold text-[var(--color-ink)] text-sm">
                            Lighter Note
                          </h3>
                        </div>
                        <p className="font-medium text-[var(--color-ink)] mb-2">
                          {talkingPoints.lightMoment.topic}
                        </p>
                        <p className="text-sm text-[var(--color-steel)] italic">
                          {talkingPoints.lightMoment.quip}
                        </p>
                      </section>
                    )}
                  </div>

                  {/* Category Quick Hits */}
                  <section>
                    <h3 className="font-semibold text-[var(--color-ink)] mb-4">
                      Quick Category Hits
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(talkingPoints.categories).map(([cat, line]) => (
                        line && (
                          <div
                            key={cat}
                            className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-paper)]
                                     border border-[var(--color-pearl)]"
                          >
                            <span className="text-lg">{categoryIcons[cat] || '📰'}</span>
                            <div>
                              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-bronze)]">
                                {cat}
                              </span>
                              <p className="text-sm text-[var(--color-steel)] mt-0.5">
                                {line}
                              </p>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </section>

                  {/* Footer with provider info */}
                  <div className="pt-4 border-t border-[var(--color-pearl)] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[var(--color-silver)]">
                      <Sparkles className="w-3 h-3" />
                      <span>Generated by {usedProvider === 'gemini' ? 'Google Gemini' : 'Claude AI'}</span>
                    </div>
                    <button
                      onClick={() => generateTalkingPoints()}
                      className="text-xs text-[var(--color-bronze)] hover:text-[var(--color-bronze-dark)]
                               font-medium transition-colors"
                    >
                      Regenerate
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
