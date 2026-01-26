'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import type { Article } from '@/types';
import { Clock, X } from 'lucide-react';
import { formatTimeAgo } from '@/lib/formatTime';
import { AISummary } from '@/components/ai/AISummary';

interface StoryCardProps {
  article: Article;
  variant?: 'default' | 'horizontal';
}

export function StoryCard({ article, variant = 'default' }: StoryCardProps) {
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
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

  if (variant === 'horizontal') {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex gap-4 p-4 rounded-sm bg-[var(--color-paper)]
                   shadow-[var(--shadow-card)] transition-all duration-200 ease-out
                   hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-px"
      >
        {/* Thumbnail */}
        <div className="relative flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-sm overflow-hidden
                      bg-[var(--color-pearl)]">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover article-image"
              sizes="128px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-2xl text-[var(--color-bronze)]">
                {article.source.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em]
                            text-[var(--color-bronze)]">
                {article.source.name}
              </span>
              <span className="text-[var(--color-silver)]">·</span>
              <span className="flex items-center gap-1 text-xs text-[var(--color-silver)]">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(article.publishedAt)}
              </span>
            </div>
            <h3 className="font-display text-base sm:text-lg font-medium leading-snug
                        text-[var(--color-ink)] line-clamp-2
                        group-hover:text-[var(--color-bronze-dark)] transition-colors">
              {article.title}
            </h3>
          </div>
          <p className="text-sm text-[var(--color-steel)] line-clamp-1 mt-2">
            {article.description}
          </p>
        </div>
      </a>
    );
  }

  // Check if there's more content than what's shown truncated
  const firstPara = article.fullDescription.split('\n\n')[0] || '';
  const hasMoreContent = article.fullDescription.length > firstPara.length || firstPara.length > 150;

  return (
    <div className="relative">
      {/* Expanded full-screen modal - rendered via portal to document.body */}
      {mounted && isExpanded && createPortal(
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
          style={{ zIndex: 9999 }}
          onClick={() => setIsExpanded(false)}
        >
          {/* Modal content container - full screen with padding */}
          <div
            className="fixed inset-4 sm:inset-8 lg:inset-12 overflow-y-auto
                      rounded-lg bg-[var(--color-paper)] shadow-2xl"
            style={{ zIndex: 10000 }}
            onClick={() => setIsExpanded(false)}
          >
            {/* Close button - fixed position */}
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

              {/* Full description - all paragraphs */}
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

              {/* Read full article link - only this stops close */}
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

      {/* Regular card */}
      <div
        onClick={(e) => {
          if (hasMoreContent) {
            e.preventDefault();
            setIsExpanded(true);
          }
        }}
        className={`group relative flex flex-col rounded-sm bg-[var(--color-paper)] overflow-hidden
                   shadow-[var(--shadow-card)] transition-all duration-200 ease-out
                   hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5
                   ${hasMoreContent ? 'cursor-pointer' : ''}`}
      >
        {/* Image container with fixed aspect ratio */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-pearl)]">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover article-image transition-transform duration-300 ease-out
                       group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-bronze-muted)]
                            flex items-center justify-center">
                <span className="font-display text-2xl text-[var(--color-bronze)]">
                  {article.source.name.charAt(0)}
                </span>
              </div>
            </div>
          )}

          {/* Category pill overlay */}
          <div className="absolute top-3 left-3">
            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold
                          uppercase tracking-[0.08em] bg-[var(--color-paper)]/95 backdrop-blur-sm
                          text-[var(--color-bronze-dark)] shadow-sm">
              {article.source.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4 sm:p-5">
          {/* Timestamp */}
          <div className="flex items-center gap-1.5 mb-2.5 text-xs text-[var(--color-silver)]">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(article.publishedAt)}
          </div>

          {/* Headline */}
          <h3 className="font-display text-lg sm:text-xl font-medium leading-snug
                        text-[var(--color-ink)] line-clamp-2 mb-2
                        group-hover:text-[var(--color-bronze-dark)] transition-colors duration-150">
            {article.title}
          </h3>

          {/* Description - show first paragraph, truncated */}
          <p className="text-sm text-[var(--color-steel)] leading-relaxed line-clamp-3 flex-1">
            {firstPara}
          </p>

          {/* Bottom: expand hint or read link */}
          <div className="mt-4 pt-3 border-t border-[var(--color-pearl)] flex items-center justify-between">
            {hasMoreContent ? (
              <span className="text-xs font-medium text-[var(--color-bronze)]
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Click to expand ↗
              </span>
            ) : (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[var(--color-bronze)]
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                Read article →
              </a>
            )}
          </div>
        </div>

        {/* Decorative hover accent */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-bronze)]
                      transform scale-x-0 origin-left group-hover:scale-x-100
                      transition-transform duration-300 ease-out" />
      </div>
    </div>
  );
}
