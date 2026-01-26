'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Article } from '@/types';
import { Clock, ChevronRight, X } from 'lucide-react';
import { formatTimeAgo } from '@/lib/formatTime';
import { AISummary } from '@/components/ai/AISummary';

interface CompactCardProps {
  article: Article;
  index?: number;
}

export function CompactCard({ article, index = 0 }: CompactCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Need to wait for client-side mount to use portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

  return (
    <>
      {/* Expanded modal - rendered via portal */}
      {mounted && isExpanded && createPortal(
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
          style={{ zIndex: 9999 }}
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="fixed inset-4 sm:inset-8 lg:inset-12 overflow-y-auto
                      rounded-lg bg-[var(--color-paper)] shadow-2xl"
            style={{ zIndex: 10000 }}
            onClick={() => setIsExpanded(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 z-30 p-3 rounded-full bg-black/60 backdrop-blur-sm
                       text-white hover:bg-black/80 transition-colors shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Content */}
            <div className="p-6 sm:p-8 lg:p-12 max-w-3xl mx-auto">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-semibold uppercase tracking-[0.1em]
                              text-[var(--color-bronze)]">
                  {article.source.name}
                </span>
                <span className="text-[var(--color-silver)]">·</span>
                <span className="flex items-center gap-1 text-sm text-[var(--color-silver)]">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTimeAgo(article.publishedAt)}
                </span>
                {article.author && (
                  <>
                    <span className="text-[var(--color-silver)]">·</span>
                    <span className="text-sm text-[var(--color-silver)]">
                      {article.author}
                    </span>
                  </>
                )}
              </div>

              {/* Headline */}
              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight
                          text-[var(--color-ink)] mb-6">
                {article.title}
              </h3>

              {/* Full description */}
              <div className="text-base sm:text-lg lg:text-xl text-[var(--color-steel)] leading-relaxed space-y-4">
                {article.fullDescription.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* AI Summary - only for allowed users */}
              <div onClick={(e) => e.stopPropagation()}>
                <AISummary
                  title={article.title}
                  content={article.fullDescription}
                  source={article.source.name}
                />
              </div>

              {/* Read full article link */}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full
                         bg-[var(--color-bronze)] text-white text-base font-medium
                         hover:bg-[var(--color-bronze-dark)] transition-colors shadow-lg"
              >
                Read full article →
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Compact card row */}
      <div
        onClick={() => setIsExpanded(true)}
        className="group relative flex items-start gap-4 py-4 px-1 cursor-pointer
                   border-b border-[var(--color-pearl)] last:border-b-0
                   transition-colors duration-150 hover:bg-[var(--color-paper)]/50"
        style={{
          animationDelay: `${index * 50}ms`,
        }}
      >
        {/* Index number - editorial style */}
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-parchment)]
                        flex items-center justify-center
                        text-sm font-semibold text-[var(--color-steel)]
                        group-hover:bg-[var(--color-bronze-muted)]
                        group-hover:text-[var(--color-bronze-dark)]
                        transition-colors duration-150">
          {(index + 1).toString().padStart(2, '0')}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta line */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em]
                          text-[var(--color-bronze)]">
              {article.source.name}
            </span>
            <span className="w-1 h-1 rounded-full bg-[var(--color-silver)]" />
            <span className="flex items-center gap-1 text-xs text-[var(--color-silver)]">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(article.publishedAt)}
            </span>
          </div>

          {/* Headline */}
          <h4 className="font-display text-base font-medium leading-snug
                        text-[var(--color-ink)]
                        group-hover:text-[var(--color-bronze-dark)] transition-colors duration-150">
            {article.title}
          </h4>

          {/* Description */}
          <p className="text-sm text-[var(--color-steel)] leading-relaxed mt-1.5">
            {article.description}
          </p>
        </div>

        {/* Expand indicator */}
        <ChevronRight
          className="flex-shrink-0 w-5 h-5 text-[var(--color-silver)]
                    opacity-0 group-hover:opacity-100 group-hover:translate-x-1
                    transition-all duration-200 mt-1"
        />

        {/* Hover accent line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-[var(--color-bronze)]
                      group-hover:h-8 transition-all duration-200 rounded-full" />
      </div>
    </>
  );
}

interface CompactCardListProps {
  articles: Article[];
  title?: string;
}

export function CompactCardList({ articles, title }: CompactCardListProps) {
  if (articles.length === 0) return null;

  return (
    <div className="bg-[var(--color-paper)] rounded-sm shadow-[var(--shadow-card)] overflow-hidden">
      {title && (
        <div className="px-5 py-4 border-b border-[var(--color-pearl)]">
          <h3 className="font-display text-lg font-semibold text-[var(--color-ink)]
                       flex items-center gap-3">
            <span className="w-8 h-0.5 bg-[var(--color-bronze)]" />
            {title}
          </h3>
        </div>
      )}
      <div className="px-4">
        {articles.map((article, index) => (
          <CompactCard key={article.id} article={article} index={index} />
        ))}
      </div>
    </div>
  );
}
