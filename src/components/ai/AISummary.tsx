'use client';

import { useState } from 'react';
import { Sparkles, Loader2, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isAIAllowedClient } from '@/lib/aiTypes';

interface ArticleSummary {
  keyPoints: string[];
  tldr: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  topics: string[];
}

interface AISummaryProps {
  title: string;
  content: string;
  source: string;
}

const sentimentConfig = {
  positive: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', label: 'Positive' },
  negative: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50', label: 'Negative' },
  neutral: { icon: Minus, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Neutral' },
  mixed: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Mixed' },
};

export function AISummary({ title, content, source }: AISummaryProps) {
  const { user, getToken } = useAuth();
  const [summary, setSummary] = useState<ArticleSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show for allowed users
  if (!isAIAllowedClient(user?.email)) return null;

  const generateSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/ai/summarise', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, source }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (summary) {
    const SentimentIcon = sentimentConfig[summary.sentiment].icon;

    return (
      <div className="mt-6 p-5 rounded-lg bg-gradient-to-br from-[var(--color-bronze-muted)]/30 to-[var(--color-parchment)]
                    border border-[var(--color-bronze-muted)]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[var(--color-bronze)]" />
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-bronze)]">
            AI Analysis
          </span>
        </div>

        {/* TL;DR */}
        <p className="text-base font-medium text-[var(--color-ink)] mb-4">
          {summary.tldr}
        </p>

        {/* Key Points */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-steel)] mb-2">
            Key Points
          </h4>
          <ul className="space-y-2">
            {summary.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-steel)]">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-bronze-muted)]
                              flex items-center justify-center text-xs font-semibold text-[var(--color-bronze-dark)]">
                  {i + 1}
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer: Sentiment + Topics */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--color-pearl)]">
          {/* Sentiment badge */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                        ${sentimentConfig[summary.sentiment].bg} ${sentimentConfig[summary.sentiment].color}`}>
            <SentimentIcon className="w-3.5 h-3.5" />
            {sentimentConfig[summary.sentiment].label}
          </div>

          {/* Topics */}
          {summary.topics.map((topic, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full text-xs font-medium
                       bg-[var(--color-paper)] text-[var(--color-steel)]
                       border border-[var(--color-pearl)]"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={generateSummary}
      disabled={loading}
      className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
               bg-gradient-to-r from-[var(--color-bronze)] to-[var(--color-bronze-dark)]
               text-white text-sm font-medium
               hover:from-[var(--color-bronze-dark)] hover:to-[var(--color-ink)]
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-all duration-200 shadow-md hover:shadow-lg"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Analysing...</span>
        </>
      ) : error ? (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>Try again</span>
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          <span>AI Summary</span>
        </>
      )}
    </button>
  );
}
