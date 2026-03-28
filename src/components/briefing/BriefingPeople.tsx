'use client';

import { useState } from 'react';
import { Users, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import type { WeeklyBios, WeeklyBio } from '@/lib/aiTypes';
import { PeopleSkeleton } from './BriefingSkeleton';

interface BriefingPeopleProps {
  people: WeeklyBios | null;
  isLoading: boolean;
  canRefresh: boolean;
  onRefresh: () => void;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  tech: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  finance: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  uk: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  world: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  sport: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  culture: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  science: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
};

function WikipediaImage({
  name,
  onError,
  fallback,
}: {
  name: string;
  onError: () => void;
  fallback: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useState(() => {
    const fetchImage = async () => {
      try {
        const encodedName = encodeURIComponent(name);
        const response = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${encodedName}&prop=pageimages&format=json&pithumbsize=300&origin=*`
        );
        const data = await response.json();
        const pages = data.query?.pages;
        if (pages) {
          const page = Object.values(pages)[0] as { thumbnail?: { source: string } };
          if (page?.thumbnail?.source) {
            setImageUrl(page.thumbnail.source);
          } else {
            onError();
          }
        } else {
          onError();
        }
      } catch {
        onError();
      } finally {
        setLoading(false);
      }
    };
    fetchImage();
  });

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--color-bronze)] animate-spin" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl || fallback}
      alt={name}
      className="w-full h-full object-cover object-top"
      onError={onError}
    />
  );
}

function PersonCard({ bio, index }: { bio: WeeklyBio; index: number }) {
  const [imageError, setImageError] = useState(false);
  const colors = categoryColors[bio.category] || categoryColors.world;
  const wikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(bio.name.replace(/ /g, '_'))}`;
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(bio.name)}&size=300&background=b8860b&color=fff&bold=true`;

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${colors.bg} ${colors.border} border-2
                  transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
    >
      {/* Rank badge */}
      <div className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-[var(--color-bronze)]
                    text-white font-bold flex items-center justify-center shadow-md">
        {index + 1}
      </div>

      {/* Photo section */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-[var(--color-parchment)] to-[var(--color-pearl)]">
        {!imageError ? (
          <WikipediaImage
            name={bio.name}
            onError={() => setImageError(true)}
            fallback={fallbackAvatar}
          />
        ) : (
          <img
            src={fallbackAvatar}
            alt={bio.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className={`absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-semibold
                       ${colors.bg} ${colors.text} backdrop-blur-sm`}>
          {bio.category.toUpperCase()}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display text-lg font-bold text-[var(--color-ink)] leading-tight">
            {bio.name}
          </h3>
          <p className={`text-sm font-medium ${colors.text}`}>
            {bio.role}
          </p>
        </div>

        <div className="space-y-2 text-sm text-[var(--color-steel)]">
          <div>
            <span className="font-semibold text-[var(--color-ink)]">Who: </span>
            {bio.whoTheyAre}
          </div>
          <div>
            <span className="font-semibold text-[var(--color-ink)]">Known for: </span>
            {bio.whyFamous}
          </div>
          <div className="pt-2 border-t border-[var(--color-pearl)]">
            <span className="font-semibold text-[var(--color-bronze)]">This week: </span>
            {bio.whyInNews}
          </div>
        </div>

        <a
          href={wikipediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[var(--color-bronze)]
                   hover:text-[var(--color-bronze-dark)] transition-colors"
        >
          Read more on Wikipedia
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

export function BriefingPeople({ people, isLoading, canRefresh, onRefresh }: BriefingPeopleProps) {
  if (isLoading) return <PeopleSkeleton />;
  if (!people || people.bios.length === 0) return null;

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em]
                       text-[var(--color-bronze)]">
          <Users className="w-4 h-4" />
          People in the News
        </h2>
        <div className="flex items-center gap-3">
          {canRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1 text-xs text-[var(--color-bronze)]
                       hover:text-[var(--color-bronze-dark)] font-medium transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          )}
          <Link
            href="/people"
            className="text-xs text-[var(--color-steel)] hover:text-[var(--color-bronze)]
                     font-medium transition-colors"
          >
            View Full Catalog →
          </Link>
        </div>
      </div>

      {/* Intro */}
      {people.intro && (
        <p className="text-base text-[var(--color-steel)] italic border-l-4 border-[var(--color-bronze)] pl-4 mb-6">
          {people.intro}
        </p>
      )}

      {/* People grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {people.bios.map((bio, index) => (
          <PersonCard key={bio.name} bio={bio} index={index} />
        ))}
      </div>
    </section>
  );
}
