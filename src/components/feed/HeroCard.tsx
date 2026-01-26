'use client';

import Image from 'next/image';
import type { Article } from '@/types';
import { Clock, ExternalLink } from 'lucide-react';
import { formatTimeAgoLong } from '@/lib/formatTime';

interface HeroCardProps {
  article: Article;
}

export function HeroCard({ article }: HeroCardProps) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-sm bg-[var(--color-paper)]
                 shadow-[var(--shadow-card)] transition-all duration-300 ease-out
                 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5"
    >
      {/* Main container with newspaper-style aspect ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] min-h-[320px] lg:min-h-[420px]">

        {/* Image section */}
        <div className="relative overflow-hidden bg-[var(--color-pearl)]">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover article-image transition-transform duration-500 ease-out
                       group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-[var(--color-bronze-muted)]
                            flex items-center justify-center">
                <span className="font-display text-4xl text-[var(--color-bronze)]">
                  {article.source.name.charAt(0)}
                </span>
              </div>
            </div>
          )}

          {/* Gradient overlay for text legibility on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                        lg:hidden" />

          {/* Mobile headline overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:hidden">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold leading-tight text-white
                        tracking-[-0.02em]">
              {article.title}
            </h2>
          </div>
        </div>

        {/* Content section */}
        <div className="relative flex flex-col justify-between p-6 lg:p-8 xl:p-10">
          {/* Top section: Source badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full
                          bg-[var(--color-bronze-muted)] text-[var(--color-bronze-dark)]
                          text-xs font-semibold uppercase tracking-[0.1em]">
              {article.source.name}
            </span>
            <span className="flex items-center gap-1.5 text-[var(--color-silver)] text-sm">
              <Clock className="w-3.5 h-3.5" />
              {formatTimeAgoLong(article.publishedAt)}
            </span>
          </div>

          {/* Middle section: Headline and description */}
          <div className="flex-1">
            {/* Desktop headline (hidden on mobile since it's in the overlay) */}
            <h2 className="hidden lg:block font-display text-2xl xl:text-3xl 2xl:text-4xl
                        font-semibold leading-[1.15] text-[var(--color-ink)] mb-4
                        tracking-[-0.02em] group-hover:text-[var(--color-bronze-dark)]
                        transition-colors duration-200">
              {article.title}
            </h2>

            <div className="text-[var(--color-steel)] text-base lg:text-lg leading-relaxed">
              {article.fullDescription.split('\n\n').slice(0, 2).map((para, i) => (
                <p key={i} className={i > 0 ? 'mt-3 hidden xl:block' : ''}>
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Bottom section: Read more indicator */}
          <div className="flex items-center justify-between mt-6 pt-4
                        border-t border-[var(--color-pearl)]">
            <span className="text-sm text-[var(--color-silver)]">
              {article.author && `By ${article.author}`}
            </span>
            <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-bronze)]
                          group-hover:text-[var(--color-bronze-dark)] transition-colors">
              Read full story
              <ExternalLink className="w-4 h-4 transition-transform duration-200
                                     group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Decorative corner accent */}
      <div className="absolute top-0 left-0 w-1 h-16 bg-[var(--color-bronze)]
                    transform origin-top scale-y-0 group-hover:scale-y-100
                    transition-transform duration-300 ease-out" />
    </a>
  );
}
